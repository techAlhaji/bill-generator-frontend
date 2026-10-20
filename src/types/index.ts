/**
 * Domain Type Definitions for Stellar Bill Generator Frontend
 * Aligned with bill-generator-backend OpenAPI 3.0 specification & Soroban InvoiceRegistry contract.
 */

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type CurrencyType = 'NATIVE_XLM' | 'STELLAR_CLASSIC' | 'SOROBAN_TOKEN';

export type PaymentMethod = 'STELLAR_CLASSIC' | 'SOROBAN_TOKEN';

export type PaymentStatus = 'CONFIRMED' | 'PARTIAL' | 'EXCESS' | 'UNDERPAID' | 'REJECTED';

export interface Merchant {
  id: string;
  email: string;
  businessName: string;
  stellarAddress: string;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  merchantId: string;
  name: string;
  email: string;
  address?: string | null;
  taxId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantityScale4: string; // Integer scaled by 10^4 (e.g., "10000" for 1 unit, "25000" for 2.5)
  unitPriceMinor: string; // Minor units (e.g., stroops for XLM, cents for fiat stablecoins)
  totalMinor?: string;
  sortOrder?: number;
}

export interface Invoice {
  id: string;
  merchantId: string;
  clientId: string;
  client?: Client;
  invoiceNumber: string;
  publicToken: string;
  status: InvoiceStatus;
  currencyType: CurrencyType;
  assetCode: string;
  assetIssuer?: string | null;
  tokenContractId?: string | null;
  subtotalMinor: string;
  taxRateBps: number;
  taxMinor: string;
  discountMinor: string;
  totalMinor: string;
  amountStroops: string;
  memoText: string;
  contentHash: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string | null;
  onchainInvoiceId?: string | null;
  onchainTxHash?: string | null;
  items: InvoiceItem[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicInvoiceItem {
  description: string;
  quantityScale4: string;
  unitPriceMinor: string;
  totalMinor: string;
}

export interface PublicInvoice {
  invoiceNumber: string;
  status: InvoiceStatus;
  merchantBusinessName: string;
  merchantStellarAddress: string;
  clientName: string;
  currencyType: CurrencyType;
  assetCode: string;
  assetIssuer?: string | null;
  tokenContractId?: string | null;
  subtotalMinor: string;
  taxRateBps: number;
  taxMinor: string;
  discountMinor: string;
  totalMinor: string;
  amountStroops: string;
  memoText: string;
  contentHash: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string | null;
  onchainTxHash?: string | null;
  items: PublicInvoiceItem[];
}

export interface PublicInvoiceStatusResponse {
  status: InvoiceStatus;
  paidAt?: string | null;
  txHash?: string | null;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  amountStroops: string;
  excessStroops: string;
  txHash: string;
  payerAddress?: string | null;
  paymentMethod: PaymentMethod;
  status: string;
  verifiedAt: string;
  createdAt: string;
}

export interface InvoiceAuditLog {
  id: string;
  invoiceId: string;
  action: string;
  actorType: string;
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface ApiProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  timestamp: string;
  invalidParams?: Array<{
    name: string;
    reason: string;
  }>;
}

// Request / Form payload types
export interface CreateClientInput {
  name: string;
  email: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}

export interface CreateInvoiceItemInput {
  description: string;
  quantityScale4: string;
  unitPriceMinor: string;
}

export interface CreateInvoiceInput {
  clientId: string;
  invoiceNumber?: string;
  currencyType: CurrencyType;
  assetCode: string;
  assetIssuer?: string | null;
  tokenContractId?: string | null;
  taxRateBps: number;
  discountMinor: string;
  notes?: string | null;
  issueDate: string;
  dueDate: string;
  items: CreateInvoiceItemInput[];
}

export interface UpdateInvoiceInput {
  clientId?: string;
  currencyType?: CurrencyType;
  assetCode?: string;
  assetIssuer?: string | null;
  tokenContractId?: string | null;
  taxRateBps?: number;
  discountMinor?: string;
  notes?: string | null;
  issueDate?: string;
  dueDate?: string;
  items?: CreateInvoiceItemInput[];
}

export interface VerifyPaymentInput {
  transactionHash: string;
  paymentMethod: PaymentMethod;
  payerWalletAddress?: string;
}

export interface VerifyPaymentResult {
  status: string;
  invoiceStatus: InvoiceStatus;
  transactionHash: string;
  amountStroops: string;
  excessStroops: string;
  verifiedAt: string;
}

export interface UpdateMerchantProfileInput {
  businessName?: string;
  stellarAddress?: string;
  settings?: Record<string, unknown>;
}
