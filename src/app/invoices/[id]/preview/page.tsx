'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/auth-context';
import { api } from '../../../../lib/api';
import { Invoice } from '../../../../types';
import { formatCurrency, formatScale4ToQuantity, formatBpsToPercent } from '../../../../lib/math';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Alert } from '../../../../components/ui/alert';
import {
  Printer,
  Download,
  ArrowLeft,
  Building,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export default function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { merchant, isAuthenticated, isLoading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    async function loadInvoice() {
      try {
        setLoading(true);
        const res = await api.invoices.getById(id);
        setInvoice(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice preview.');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadInvoice();
    }
  }, [authLoading, isAuthenticated, id, router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const blobUrl = await api.invoices.getPdfBlobUrl(id);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `invoice-${invoice?.invoiceNumber || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 flex justify-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-xl shadow space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 flex justify-center">
        <div className="w-full max-w-lg space-y-4">
          <Alert variant="error" title="Invoice Not Found">
            The requested invoice could not be loaded.
          </Alert>
          <Link href="/invoices">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Floating Control Bar (Hidden when printed) */}
      <div className="no-print mx-auto max-w-4xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <Link href={`/invoices/${invoice.id}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Invoice Details
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            isLoading={downloading}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1.5 shadow-sm">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </div>

      {error && (
        <div className="no-print mx-auto max-w-4xl mb-4">
          <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      {/* Printable Invoice Sheet */}
      <div
        id="invoice-print-area"
        className="mx-auto max-w-4xl bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-12 text-slate-900 transition-all"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                SB
              </div>
              <span className="font-bold text-lg text-slate-900">
                {merchant?.businessName || 'Merchant'}
              </span>
            </div>
            <p className="text-xs text-slate-500">{merchant?.email}</p>
            <p className="text-[11px] font-mono text-slate-400 mt-1 max-w-sm truncate">
              Stellar Address: {merchant?.stellarAddress}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">COMMERCIAL INVOICE</h1>
            <p className="font-bold text-indigo-600 text-lg">{invoice.invoiceNumber}</p>
            <div className="pt-1">
              <Badge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Invoice Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-slate-200 text-sm">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Billed To
            </h3>
            <p className="font-bold text-slate-900 text-base">{invoice.client?.name}</p>
            <p className="text-slate-600 text-xs mt-0.5">{invoice.client?.email}</p>
            {invoice.client?.taxId && (
              <p className="text-slate-500 text-xs mt-1">
                Tax ID / VAT: <span className="font-mono">{invoice.client.taxId}</span>
              </p>
            )}
            {invoice.client?.address && (
              <p className="text-slate-500 text-xs mt-1 max-w-xs">{invoice.client.address}</p>
            )}
          </div>

          <div className="space-y-2 sm:text-right">
            <div>
              <span className="text-xs text-slate-400 block">Issue Date</span>
              <span className="font-semibold text-slate-800">{invoice.issueDate}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Payment Due Date</span>
              <span className="font-semibold text-slate-800">{invoice.dueDate}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Payment Asset</span>
              <span className="font-semibold text-indigo-600">
                {invoice.currencyType === 'NATIVE_XLM' ? 'Stellar Lumens (XLM)' : invoice.assetCode}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-8">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-4 font-medium text-slate-900">{item.description}</td>
                  <td className="py-4 text-right text-slate-600">
                    {formatScale4ToQuantity(item.quantityScale4)}
                  </td>
                  <td className="py-4 text-right text-slate-600">
                    {formatCurrency(item.unitPriceMinor, invoice.assetCode)}
                  </td>
                  <td className="py-4 text-right font-semibold text-slate-900">
                    {formatCurrency(item.totalMinor || '0', invoice.assetCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown & Notes */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-8">
          <div className="flex-1 space-y-4">
            {invoice.notes && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Terms &amp; Instructions
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {invoice.notes}
                </p>
              </div>
            )}

            {/* Stellar Settlement Notice */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Stellar Network Settlement Details
              </div>
              <div className="space-y-1 text-slate-700">
                <div>
                  <span className="text-slate-500">Destination Account: </span>
                  <span className="font-mono text-[11px] font-semibold break-all">
                    {merchant?.stellarAddress}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Mandatory Memo: </span>
                  <span className="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-900">
                    {invoice.memoText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-72 space-y-2.5 text-sm self-end">
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
            <div className="pt-3 border-t-2 border-slate-900 flex justify-between text-lg font-extrabold text-slate-900">
              <span>Total Due</span>
              <span className="text-indigo-600">
                {formatCurrency(invoice.totalMinor, invoice.assetCode)}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 text-right">
              Exact minor units: {invoice.amountStroops} stroops
            </p>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <span>Settled via StellarBills &bull; Stellar Testnet Protocol 22</span>
          {invoice.contentHash && (
            <span className="font-mono truncate max-w-sm">
              Digest: {invoice.contentHash.slice(0, 32)}...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
