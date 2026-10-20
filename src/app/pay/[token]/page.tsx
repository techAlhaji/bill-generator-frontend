'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { api, ApiError } from '../../../lib/api';
import { PublicInvoice } from '../../../types';
import { formatCurrency, formatScale4ToQuantity, formatBpsToPercent } from '../../../lib/math';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Alert } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { PaymentModal } from '../../../components/wallet/payment-modal';
import {
  ShieldCheck,
  Wallet,
  Download,
  Copy,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Building,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

export default function PublicPayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIs404(false);
      const res = await api.public.getInvoice(token);
      setInvoice(res.data);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setIs404(true);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to retrieve invoice.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Polling for invoice payment status every 4 seconds if unpaid
  useEffect(() => {
    if (!invoice || invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await api.public.getStatus(token);
        if (statusRes.status === 'PAID') {
          // Re-fetch complete invoice to update view
          fetchInvoice();
        }
      } catch {
        // Polling error silently ignored
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [invoice, token, fetchInvoice]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const blobUrl = await api.public.getPdfBlobUrl(token);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `invoice-${invoice?.invoiceNumber || token}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center">
        <div className="w-full max-w-3xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (is404) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 flex justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invoice Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This payment link is invalid, has expired, or refers to an unissued draft invoice.
          </p>
          <div className="pt-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {error && (
          <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Status Callout Banner */}
        {invoice.status === 'PAID' && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 flex-shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Invoice Settled &amp; Confirmed
                </h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Paid on {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : 'Ledger'}.
                  Cryptographically verified on Stellar Testnet.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPdf}
              isLoading={downloadingPdf}
              className="bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 gap-1.5"
            >
              <Download className="h-4 w-4" />
              Download Official Receipt
            </Button>
          </div>
        )}

        {invoice.status === 'CANCELLED' && (
          <Alert variant="warning" title="Invoice Voided">
            This invoice was cancelled by the issuer. No payments should be dispatched.
          </Alert>
        )}

        {invoice.status === 'OVERDUE' && (
          <Alert variant="error" title="Payment Overdue">
            This invoice was due on {invoice.dueDate}. Please arrange immediate settlement.
          </Alert>
        )}

        {/* Main Invoice Sheet */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Commercial Invoice
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Issued by {invoice.merchantBusinessName}
              </p>
            </div>

            <div className="sm:text-right flex flex-col items-start sm:items-end gap-2">
              <Badge status={invoice.status} />
              <div className="text-xs text-slate-500">
                <span>Due Date: </span>
                <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Billed To
              </span>
              <p className="font-bold text-slate-900">{invoice.clientName}</p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                Settlement Asset
              </span>
              <p className="font-bold text-indigo-600">
                {invoice.currencyType === 'NATIVE_XLM' ? 'Stellar Lumens (XLM)' : invoice.assetCode}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 font-medium text-slate-900">{item.description}</td>
                    <td className="py-4 text-right text-slate-600">
                      {formatScale4ToQuantity(item.quantityScale4)}
                    </td>
                    <td className="py-4 text-right text-slate-600">
                      {formatCurrency(item.unitPriceMinor, invoice.assetCode)}
                    </td>
                    <td className="py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(item.totalMinor, invoice.assetCode)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Authoritative Totals */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <div className="w-full sm:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotalMinor, invoice.assetCode)}
                </span>
              </div>
              {BigInt(invoice.discountMinor || '0') > 0n && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="font-medium text-rose-600">
                    -{formatCurrency(invoice.discountMinor, invoice.assetCode)}
                  </span>
                </div>
              )}
              {invoice.taxRateBps > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax ({formatBpsToPercent(invoice.taxRateBps)})</span>
                  <span className="font-medium">
                    +{formatCurrency(invoice.taxMinor, invoice.assetCode)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-indigo-600">
                  {formatCurrency(invoice.totalMinor, invoice.assetCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Action Section (If Unpaid) */}
          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-white p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Pay with Stellar Wallet
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    1-click non-custodial payment via Freighter on Stellar Testnet.
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="gap-2 shadow-lg shadow-indigo-600/20 px-6 font-semibold"
                >
                  <Wallet className="h-4 w-4" />
                  Pay {formatCurrency(invoice.totalMinor, invoice.assetCode)}
                </Button>
              </div>

              {/* Manual Transfer Information */}
              <div className="pt-4 border-t border-indigo-100 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  Or settle manually using Lobstr, xBull, or Albedo:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Recipient Stellar Account</span>
                    <div className="flex items-center justify-between">
                      <code className="text-slate-800 font-mono text-[11px] truncate mr-2">
                        {invoice.merchantStellarAddress}
                      </code>
                      <button
                        onClick={() => handleCopy(invoice.merchantStellarAddress, 'recipient')}
                        className="text-slate-400 hover:text-indigo-600 flex-shrink-0"
                        title="Copy Address"
                      >
                        {copiedKey === 'recipient' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                    <span className="text-slate-400 text-[11px] block">
                      Mandatory Memo (Required for settlement match)
                    </span>
                    <div className="flex items-center justify-between">
                      <code className="text-indigo-900 font-mono font-bold text-xs bg-indigo-50 px-2 py-0.5 rounded">
                        {invoice.memoText}
                      </code>
                      <button
                        onClick={() => handleCopy(invoice.memoText, 'memo')}
                        className="text-slate-400 hover:text-indigo-600 flex-shrink-0"
                        title="Copy Memo"
                      >
                        {copiedKey === 'memo' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Cryptographic capability token verified &bull; Stellar Testnet Protocol 22
            </span>
            {invoice.contentHash && (
              <span className="font-mono truncate max-w-xs">
                Hash: {invoice.contentHash.slice(0, 24)}...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={invoice}
        publicToken={token}
        onPaymentConfirmed={() => {
          setIsPaymentModalOpen(false);
          fetchInvoice();
        }}
      />
    </div>
  );
}
