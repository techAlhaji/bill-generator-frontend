/**
 * Stellar Wallet & Payment Orchestration Layer
 * SSR-safe Freighter extension connector and Horizon transaction builder.
 */

import {
  Horizon,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
} from '@stellar/stellar-sdk';

const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

export interface WalletConnection {
  address: string;
  network?: string;
}

export interface BuildPaymentTxParams {
  sourceAddress: string;
  destinationAddress: string;
  amountStroops: string; // Minor units (1 XLM = 10,000,000 stroops)
  assetCode?: string;
  assetIssuer?: string | null;
  memoText?: string;
  baseFeeStroops?: string;
}

export interface SubmitPaymentResult {
  txHash: string;
  ledger: number;
}

/**
 * Checks if Freighter wallet is installed in the browser.
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const { isConnected } = await import('@stellar/freighter-api');
    const result = await isConnected();
    return !!result.isConnected;
  } catch {
    return false;
  }
}

/**
 * Connects to Freighter wallet and requests public key access.
 */
export async function connectFreighter(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet connection is only available in browser environment.');
  }

  const { isConnected, requestAccess, getNetwork } = await import('@stellar/freighter-api');

  const connectionCheck = await isConnected();
  if (!connectionCheck.isConnected) {
    throw new Error(
      'Freighter wallet is not installed or detected. Please install Freighter from https://www.freighter.app'
    );
  }

  const access = await requestAccess();
  if (access.error || !access.address) {
    throw new Error(access.error ? String(access.error) : 'User denied Freighter wallet access.');
  }

  let network: string | undefined;
  try {
    const net = await getNetwork();
    network = net?.network;
  } catch {
    // Network check optional
  }

  return {
    address: access.address,
    network,
  };
}

/**
 * Signs a transaction XDR using Freighter.
 */
export async function signTransactionWithFreighter(
  txXdr: string,
  networkPassphrase: string = NETWORK_PASSPHRASE
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Wallet signing is only available in browser environment.');
  }

  const { signTransaction } = await import('@stellar/freighter-api');
  const result = await signTransaction(txXdr, {
    networkPassphrase,
  });

  if (result.error || !result.signedTxXdr) {
    throw new Error(result.error ? String(result.error) : 'Transaction was rejected by user in wallet.');
  }

  return result.signedTxXdr;
}

/**
 * Builds an unsigned Stellar Payment transaction XDR with memo.
 */
export async function buildStellarPaymentTx(params: BuildPaymentTxParams): Promise<string> {
  const server = new Horizon.Server(HORIZON_URL);

  // 1. Load source account sequence number
  let account: Horizon.AccountResponse;
  try {
    account = await server.loadAccount(params.sourceAddress);
  } catch (err) {
    throw new Error(
      `Payer account (${params.sourceAddress}) does not exist on Testnet or has insufficient balance for base reserve.`
    );
  }

  // 2. Determine Asset
  let asset = Asset.native();
  if (params.assetCode && params.assetCode !== 'XLM' && params.assetIssuer) {
    asset = new Asset(params.assetCode, params.assetIssuer);
  }

  // Convert minor stroops to decimal string for Stellar SDK (e.g. 10000000 -> "1.0000000")
  const stroopsBig = BigInt(params.amountStroops);
  const whole = stroopsBig / 10_000_000n;
  const frac = (stroopsBig % 10_000_000n).toString().padStart(7, '0');
  const amountDecimal = `${whole}.${frac}`;

  // 3. Build Transaction
  const baseFee = params.baseFeeStroops ? Number(params.baseFeeStroops) : 100;
  const txBuilder = new TransactionBuilder(account, {
    fee: baseFee.toString(),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: params.destinationAddress,
        asset,
        amount: amountDecimal,
      })
    )
    .setTimeout(300);

  // 4. Attach Memo if provided (max 28 bytes)
  if (params.memoText) {
    // Truncate to 28 bytes if needed
    const truncatedMemo = params.memoText.slice(0, 28);
    txBuilder.addMemo(Memo.text(truncatedMemo));
  }

  const transaction = txBuilder.build();
  return transaction.toXDR();
}

/**
 * Submits a signed transaction XDR directly to Stellar Horizon.
 */
export async function submitTransactionToHorizon(signedXdr: string): Promise<SubmitPaymentResult> {
  const server = new Horizon.Server(HORIZON_URL);
  const transaction = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  try {
    const response = await server.submitTransaction(transaction);
    return {
      txHash: response.hash,
      ledger: response.ledger,
    };
  } catch (err: unknown) {
    const errorMsg =
      (err as { response?: { data?: { extras?: { result_codes?: unknown } } } })?.response?.data
        ?.extras?.result_codes
        ? JSON.stringify((err as any).response.data.extras.result_codes)
        : err instanceof Error
        ? err.message
        : 'Unknown Horizon submission failure.';
    throw new Error(`Stellar Horizon transaction submission failed: ${errorMsg}`);
  }
}
