'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { api } from '../../lib/api';
import { Invoice, PaginatedResponse } from '../../types';
import { formatCurrency } from '../../lib/math';
import { Sidebar } from '../../components/layout/sidebar';
import { StatCard } from '../../components/ui/stat-card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert } from '../../components/ui/alert';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Users,
  ArrowUpRight,
  RefreshCw,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { merchant, isAuthenticated, isLoading: authLoading } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.invoices.list({ page: 1, limit: 10 });
      setInvoices(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, router, fetchDashboardData]);

  // Compute summary stats from invoices
  let totalBilledStroops = 0n;
  let totalPaidStroops = 0n;
  let pendingCount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    const amt = BigInt(inv.amountStroops || '0');
    totalBilledStroops += amt;
    if (inv.status === 'PAID') {
      totalPaidStroops += amt;
    } else if (inv.status === 'OVERDUE') {
      overdueCount++;
    } else if (inv.status === 'ISSUED') {
      pendingCount++;
    }
  }

  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Dashboard Overview
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Welcome back, {merchant?.businessName}. Here is your financial summary.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/invoices/new">
                <Button size="sm" className="gap-1.5 shadow-sm">
                  <PlusCircle className="h-4 w-4" />
                  Create Invoice
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <Alert variant="error" title="Dashboard Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Invoiced Volume"
              value={formatCurrency(totalBilledStroops.toString(), 'XLM')}
              description="Across recent invoices"
              icon={<CreditCard className="h-5 w-5" />}
            />
            <StatCard
              title="Settled Payments"
              value={formatCurrency(totalPaidStroops.toString(), 'XLM')}
              description="Verified on Stellar blockchain"
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            />
            <StatCard
              title="Awaiting Settlement"
              value={pendingCount}
              description="Issued &amp; awaiting payment"
              icon={<Clock className="h-5 w-5 text-blue-600" />}
            />
            <StatCard
              title="Overdue Invoices"
              value={overdueCount}
              description="Past agreed due date"
              icon={<AlertCircle className="h-5 w-5 text-rose-600" />}
            />
          </div>

          {/* Quick Actions & Recent Invoices Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Invoices</h2>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all invoices
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {loading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">No invoices created yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Get started by creating your first invoice and billing your clients in native Stellar
                    XLM or Soroban tokens.
                  </p>
                  <div className="pt-2">
                    <Link href="/invoices/new">
                      <Button size="sm" className="gap-1.5">
                        <PlusCircle className="h-4 w-4" />
                        Create First Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Client</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Due Date</th>
                        <th className="px-6 py-3.5 text-right">Amount</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoices.map((inv) => (
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
                          <td className="px-6 py-4 text-slate-500 text-xs">{inv.dueDate}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-900">
                            {formatCurrency(inv.amountStroops, inv.assetCode)}
                          </td>
                          <td className="px-6 py-4 text-right text-xs">
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="font-semibold text-indigo-600 hover:text-indigo-700"
                            >
                              View &rarr;
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
