'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { api } from '../../../lib/api';
import { Invoice, PaymentRecord, InvoiceAuditLog } from '../../../types';
import { formatCurrency, formatScale4ToQuantity, formatBpsToPercent } from '../../../lib/math';
import { Sidebar } from '../../../components/layout/sidebar';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Alert } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Modal } from '../../../components/ui/modal';
import {
  ArrowLeft,
  Send,
  XCircle,
  Edit,
  Download,
  ExternalLink,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  User,
  CreditCard,
  FileText,
  Printer,
} from 'lucide-react';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<InvoiceAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchInvoiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [invRes, payRes, logsRes] = await Promise.all([
        api.invoices.getById(id),
        api.invoices.getPayments(id).catch(() => ({ data: [] })),
        api.invoices.getAuditLogs(id).catch(() => ({ data: [] })),
      ]);
      setInvoice(invRes.data);
      setPayments(payRes.data);
      setAuditLogs(logsRes.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchInvoiceDetails();
    }
  }, [authLoading, isAuthenticated, router, fetchInvoiceDetails]);

  const handleIssueInvoice = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.invoices.issue(id);
      setInvoice(res.data);
      setSuccessMessage('Invoice issued successfully! Public capability payment URL is active.');
      fetchInvoiceDetails();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to issue invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvoice = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await api.invoices.cancel(id);
      setInvoice(res.data);
      setIsCancelModalOpen(false);
      setSuccessMessage('Invoice has been cancelled.');
      fetchInvoiceDetails();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invoice.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <Alert variant="error" title="Invoice Not Found">
              The requested invoice does not exist or you do not have permission to view it.
            </Alert>
            <Link href="/invoices">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Invoices
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const publicPayUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/pay/${invoice.publicToken}`
      : `/pay/${invoice.publicToken}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          {/* Top Bar / Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/invoices">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4 text-slate-500" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                    {invoice.invoiceNumber}
                  </h1>
                  <Badge status={invoice.status} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Issued on {invoice.issueDate} &bull; Due on {invoice.dueDate}
                </p>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/invoices/${invoice.id}/preview`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Printer className="h-4 w-4" />
                  Print / Preview
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={actionLoading}
                className="gap-1.5"
              >
                <Download className="h-4 w-4" />
                PDF
              </Button>

              {invoice.status === 'DRAFT' && (
                <>
                  <Link href={`/invoices/${invoice.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    onClick={handleIssueInvoice}
                    isLoading={actionLoading}
                    className="gap-1.5 shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    Issue Invoice
                  </Button>
                </>
              )}

              {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {successMessage && (
            <Alert variant="success" title="Success" onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Public capability token banner (if ISSUED, PAID, or OVERDUE) */}
          {invoice.status !== 'DRAFT' && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  Public Capability Payment Link
                </span>
                <p className="text-xs text-indigo-700">
                  Share this secure URL with your client for 1-click Stellar wallet settlement.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-indigo-200 text-indigo-700 gap-1.5"
                  onClick={() => handleCopy(publicPayUrl, 'publicUrl')}
                >
                  {copiedKey === 'publicUrl' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedKey === 'publicUrl' ? 'Copied' : 'Copy Link'}
                </Button>

                <a
                  href={`/pay/${invoice.publicToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Open Pay Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Client & Billing Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4 text-indigo-600" />
                  Client / Payer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Name / Entity</span>
                  <span className="font-semibold text-slate-900">{invoice.client?.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Billing Email</span>
                  <span className="text-slate-700">{invoice.client?.email}</span>
                </div>
                {invoice.client?.taxId && (
                  <div>
                    <span className="text-xs text-slate-500 block">Tax / VAT ID</span>
                    <span className="text-slate-700 font-mono text-xs">{invoice.client.taxId}</span>
                  </div>
                )}
                {invoice.client?.address && (
                  <div>
                    <span className="text-xs text-slate-500 block">Billing Address</span>
                    <span className="text-slate-700 text-xs">{invoice.client.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  Settlement &amp; Blockchain Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Currency Protocol</span>
                  <span className="font-semibold text-slate-900">
                    {invoice.currencyType === 'NATIVE_XLM'
                      ? 'Stellar Native (XLM)'
                      : invoice.currencyType === 'STELLAR_CLASSIC'
                      ? `Stellar Classic (${invoice.assetCode})`
                      : `Soroban SEP-41 (${invoice.assetCode})`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Required Payment Memo</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-semibold">
                    {invoice.memoText}
                  </span>
                </div>
                {invoice.contentHash && (
                  <div>
                    <span className="text-xs text-slate-500 block">RFC 8785 Canonical Digest</span>
                    <span className="font-mono text-[11px] text-slate-600 truncate block">
                      {invoice.contentHash}
                    </span>
                  </div>
                )}
                {invoice.onchainTxHash && (
                  <div>
                    <span className="text-xs text-slate-500 block">Settlement Transaction Hash</span>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${invoice.onchainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {invoice.onchainTxHash.slice(0, 16)}...{invoice.onchainTxHash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Line Items Table & Authoritative Totals */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Line Items &amp; Accounting Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.description}</td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatScale4ToQuantity(item.quantityScale4)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatCurrency(item.unitPriceMinor, invoice.assetCode)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {formatCurrency(item.totalMinor || '0', invoice.assetCode)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Authoritative Totals Box */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-200">
                <div className="flex-1 space-y-2">
                  {invoice.notes && (
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="font-semibold block text-slate-700 mb-0.5">Notes &amp; Terms:</span>
                      {invoice.notes}
                    </div>
                  )}
                </div>

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
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                    <span>Total Amount Due</span>
                    <span className="text-indigo-600">
                      {formatCurrency(invoice.totalMinor, invoice.assetCode)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History & Settlement Record */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Verified Payment History
              </CardTitle>
              <CardDescription>
                Cryptographic payment settlements verified against Stellar Horizon &amp; Soroban RPC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  {invoice.status === 'PAID'
                    ? 'Payment marked settled.'
                    : 'No payments recorded for this invoice yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 uppercase font-semibold text-slate-500">
                      <tr>
                        <th className="px-4 py-2.5">Tx Hash</th>
                        <th className="px-4 py-2.5">Payer Address</th>
                        <th className="px-4 py-2.5">Method</th>
                        <th className="px-4 py-2.5">Amount</th>
                        <th className="px-4 py-2.5">Verified At</th>
                        <th className="px-4 py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 font-mono">
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${p.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center gap-1"
                            >
                              {p.txHash.slice(0, 12)}...{p.txHash.slice(-6)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {p.payerAddress ? `${p.payerAddress.slice(0, 8)}...` : 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{p.paymentMethod}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {formatCurrency(p.amountStroops, invoice.assetCode)}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{p.verifiedAt}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              CONFIRMED
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Logs */}
          {auditLogs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{log.action}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-500">{log.actorType}</span>
                      </div>
                      <span className="text-slate-400">{log.createdAt}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Cancel Invoice Confirmation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Invoice"
        description="Are you sure you want to cancel this invoice?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            Cancelling invoice <strong>{invoice.invoiceNumber}</strong> will immediately disable the
            public payment link and prevent any future settlements. This action cannot be reversed.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={actionLoading}
            >
              Go Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelInvoice}
              isLoading={actionLoading}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
