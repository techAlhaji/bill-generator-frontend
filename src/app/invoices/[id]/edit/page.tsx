'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/auth-context';
import { api } from '../../../../lib/api';
import { Invoice } from '../../../../types';
import { Sidebar } from '../../../../components/layout/sidebar';
import { InvoiceForm } from '../../../../components/invoices/invoice-form';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Alert } from '../../../../components/ui/alert';

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
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
        if (res.data.status !== 'DRAFT') {
          setError(`Invoice ${res.data.invoiceNumber} is already ${res.data.status} and cannot be edited.`);
        } else {
          setInvoice(res.data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice for editing.');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadInvoice();
    }
  }, [authLoading, isAuthenticated, id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Edit Draft Invoice {invoice?.invoiceNumber}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Modify line items, quantities, or terms prior to official issuance.
            </p>
          </div>

          {error ? (
            <Alert variant="error" title="Cannot Edit Invoice">
              {error}
            </Alert>
          ) : invoice ? (
            <InvoiceForm initialInvoice={invoice} isEditing={true} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
