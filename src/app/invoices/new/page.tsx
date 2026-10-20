'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/auth-context';
import { Sidebar } from '../../../components/layout/sidebar';
import { InvoiceForm } from '../../../components/invoices/invoice-form';

export default function NewInvoicePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
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
        <div className="max-w-5xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Create New Invoice
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Issue a professional bill with verifiable Stellar blockchain settlement.
            </p>
          </div>

          <InvoiceForm isEditing={false} />
        </div>
      </main>
    </div>
  );
}
