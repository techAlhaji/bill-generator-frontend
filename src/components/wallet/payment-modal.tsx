'use client';

import React, { useState } from 'react';
import { PublicInvoice, PaymentMethod } from '../../types';
import { formatCurrency } from '../../lib/math';
import {
  connectFreighter,
  buildStellarPaymentTx,
  signTransactionWithFreighter,
  submitTransactionToHorizon,
} from '../../lib/wallet';
import { api } from '../../lib/api';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import {
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ArrowRight,
  Info,
} from 'lucide-react';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PublicInvoice;
  publicToken: string;
  onPaymentConfirmed: () => void;
}

type PaymentStep =
  | 'CONNECT'
  | 'REVIEW'
  | 'SIGNING'
  | 'BROADCASTING'
  | 'VERIFYING'
  | 'CONFIRMED'
  | 'ERROR';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  publicToken,
  onPaymentConfirmed,
}) => {
  const [step, setStep] = useState<PaymentStep>('CONNECT');
  const [payerAddress, setPayerAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const resetState = () => {
    setStep('CONNECT');
    setPayerAddress(null);
    setTxHash(null);
    setErrorMessage(null);
    setLoading(false);
  };

  const handleClose = () => {
    if (step === 'CONFIRMED') {
      onPaymentConfirmed();
    }
    resetState();
    onClose();
  };

  // Step 1: Connect Wallet
  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const conn = await connectFreighter();
      setPayerAddress(conn.address);
      setStep('REVIEW');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Could not connect to Freighter wallet.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2-4: Execute Payment & Verify
  const handleApprovePayment = async () => {
    if (!payerAddress) {
      setErrorMessage('Payer address missing. Please reconnect wallet.');
      setStep('CONNECT');
      return;
    }

    try {
      setErrorMessage(null);

      // 1. Build Transaction
      setStep('SIGNING');
      setLoading(true);

      const unsignedXdr = await buildStellarPaymentTx({
        sourceAddress: payerAddress,
        destinationAddress: invoice.merchantStellarAddress,
        amountStroops: invoice.amountStroops,
        assetCode: invoice.assetCode,
        assetIssuer: invoice.assetIssuer,
        memoText: invoice.memoText,
      });

      // 2. Sign with Freighter
      const signedXdr = await signTransactionWithFreighter(unsignedXdr);

      // 3. Broadcast to Stellar Horizon
      setStep('BROADCASTING');
      const submitResult = await submitTransactionToHorizon(signedXdr);
      setTxHash(submitResult.txHash);

      // 4. Cryptographic Verification on Backend (Zero-Trust)
      setStep('VERIFYING');
      const paymentMethod: PaymentMethod =
        invoice.currencyType === 'SOROBAN_TOKEN' ? 'SOROBAN_TOKEN' : 'STELLAR_CLASSIC';

      const verifyRes = await api.public.verifyPayment(publicToken, {
        transactionHash: submitResult.txHash,
        paymentMethod,
        payerWalletAddress: payerAddress,
      });

      if (verifyRes.data.status === 'CONFIRMED' || verifyRes.data.invoiceStatus === 'PAID') {
        setStep('CONFIRMED');
      } else {
        throw new Error(
          `Payment verification status: ${verifyRes.data.status}. Settlement pending confirmation.`
        );
      }
    } catch (err: unknown) {
      setStep('ERROR');
      setErrorMessage(
        err instanceof Error ? err.message : 'Transaction was rejected or failed verification.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Stellar Web3 Settlement"
      description="Pay commercial invoice via non-custodial Freighter wallet."
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {errorMessage && (
          <Alert variant="error" title="Payment Failed" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-semibold border-b border-slate-100 pb-3">
          <span
            className={
              step === 'CONNECT'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-400'
            }
          >
            1. Connect
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={
              step === 'REVIEW'
                ? 'text-indigo-600 font-bold'
                : 'text-slate-400'
            }
          >
            2. Review
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={
              ['SIGNING', 'BROADCASTING', 'VERIFYING'].includes(step)
                ? 'text-indigo-600 font-bold'
                : 'text-slate-400'
            }
          >
            3. Settle
          </span>
          <span className="text-slate-300">&rarr;</span>
          <span
            className={
              step === 'CONFIRMED'
                ? 'text-emerald-600 font-bold'
                : 'text-slate-400'
            }
          >
            4. Verified
          </span>
        </div>

        {/* Step 1: Connect Wallet Screen */}
        {step === 'CONNECT' && (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connect your Stellar Wallet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Freighter wallet extension enables secure, 1-click approvals on Stellar Testnet.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={handleConnectWallet}
                isLoading={loading}
                className="w-full gap-2 shadow-sm font-semibold"
              >
                <Wallet className="h-4 w-4" />
                Connect Freighter
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Pre-Transaction Approval Review */}
        {step === 'REVIEW' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <Info className="h-4 w-4 text-indigo-600" />
                Review Transaction Parameters Before Approving
              </div>
              <p className="text-slate-600">
                Please verify that the payment amount, destination account, network, and memo
                accurately match this invoice.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm divide-y divide-slate-100">
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs text-slate-500">Intended Network</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded text-xs border border-emerald-200">
                  Stellar Testnet
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500">Merchant Recipient</span>
                <div className="text-right">
                  <span className="font-semibold text-slate-900 block text-xs">
                    {invoice.merchantBusinessName}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[200px] block">
                    {invoice.merchantStellarAddress}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500">Connected Payer</span>
                <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]">
                  {payerAddress}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500">Required Invoice Memo</span>
                <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-900">
                  {invoice.memoText}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-900">Total Settlement Amount</span>
                <div className="text-right">
                  <span className="font-extrabold text-indigo-600 text-lg">
                    {formatCurrency(invoice.totalMinor, invoice.assetCode)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({invoice.amountStroops} stroops)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={resetState}>
                Change Wallet
              </Button>
              <Button size="sm" onClick={handleApprovePayment} className="gap-2 shadow-sm font-semibold">
                Approve &amp; Pay in Freighter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: In Progress (Signing / Broadcasting / Verifying) */}
        {['SIGNING', 'BROADCASTING', 'VERIFYING'].includes(step) && (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 animate-spin">
              <Loader2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {step === 'SIGNING' && 'Waiting for Freighter signature...'}
                {step === 'BROADCASTING' && 'Submitting transaction to Stellar Testnet...'}
                {step === 'VERIFYING' && 'Cryptographically verifying payment on backend...'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {step === 'SIGNING' &&
                  'Please confirm the payment request in your Freighter wallet popup.'}
                {step === 'BROADCASTING' &&
                  'Horizon consensus node is processing the transaction sequence.'}
                {step === 'VERIFYING' &&
                  'Backend is inspecting ledger confirmation, recipient balance, and memo match.'}
              </p>
            </div>

            {txHash && (
              <div className="pt-2 text-xs font-mono text-slate-500">
                Tx Hash: {txHash.slice(0, 16)}...{txHash.slice(-8)}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmed Receipt Screen */}
        {step === 'CONFIRMED' && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Payment Successfully Settled &amp; Verified!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The transaction has achieved finality on the Stellar ledger and the invoice is
                marked PAID.
              </p>
            </div>

            {txHash && (
              <div className="rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-700">
                <span className="block text-slate-400 text-[10px] uppercase mb-1">
                  Confirmed Transaction Hash
                </span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline flex items-center justify-center gap-1"
                >
                  {txHash.slice(0, 18)}...{txHash.slice(-10)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="pt-2">
              <Button onClick={handleClose} className="w-full">
                View Settled Invoice Receipt
              </Button>
            </div>
          </div>
        )}

        {/* Error Screen */}
        {step === 'ERROR' && (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Payment Verification Unsuccessful
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The payment could not be completed or verified against the Stellar ledger.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" size="sm" onClick={resetState}>
                Start Over
              </Button>
              <Button size="sm" onClick={handleApprovePayment}>
                Retry Submission
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
