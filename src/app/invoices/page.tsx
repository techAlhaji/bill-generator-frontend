'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { api } from '../../lib/api';
import { Invoice, InvoiceStatus, CurrencyType } from '../../types';
import { formatCurrency } from '../../lib/math';
import { Sidebar } from '../../components/layout/sidebar';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function InvoicesListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.invoices.list({
        page,
        limit,
        status: statusFilter || undefined,
        currencyType: currencyFilter || undefined,
      });
      setInvoices(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.totalCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve invoices.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, currencyFilter]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchInvoices();
    }
  }, [authLoading, isAuthenticated, router, fetchInvoices]);

  // Client-side search filter by invoice number or client name
  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      (inv.client?.name && inv.client.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Invoices
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Author, monitor, issue, and reconcile Stellar commercial invoices.
              </p>
            </div>

            <Link href="/invoices/new">
              <Button className="gap-2 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </div>

          {error && (
            <Alert variant="error" title="Invoices Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Filters & Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search invoice # or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ISSUED">Issued</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              {/* Currency Filter */}
              <select
                value={currencyFilter}
                onChange={(e) => {
                  setCurrencyFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">All Currencies</option>
                <option value="NATIVE_XLM">Native XLM</option>
                <option value="STELLAR_CLASSIC">Stellar Classic</option>
                <option value="SOROBAN_TOKEN">Soroban SEP-41</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {statusFilter || search ? 'No matching invoices' : 'No invoices created yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusFilter || search
                    ? 'Try adjusting your filters or search criteria.'
                    : 'Create and issue your first invoice to get started.'}
                </p>
                {!statusFilter && !search && (
                  <div className="pt-2">
                    <Link href="/invoices/new">
                      <Button size="sm" className="gap-1.5">
                        <PlusCircle className="h-4 w-4" />
                        Create First Invoice
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Invoice #</th>
                      <th className="px-6 py-3.5">Client</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Issue Date</th>
                      <th className="px-6 py-3.5">Due Date</th>
                      <th className="px-6 py-3.5 text-right">Total Amount</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="hover:text-indigo-600 transition-colors"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {inv.client?.name || 'Unknown Client'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={inv.status} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{inv.issueDate}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{inv.dueDate}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-900">
                          {formatCurrency(inv.amountStroops, inv.assetCode)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 text-xs">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
                <span>
                  Showing {filteredInvoices.length} of {totalCount} invoices
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <span className="font-semibold px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
