'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { api, ApiError } from '../../lib/api';
import { Client, CreateClientInput, UpdateClientInput } from '../../types';
import { Sidebar } from '../../components/layout/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Modal } from '../../components/ui/modal';
import { Alert } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Building,
  FileText,
  AlertTriangle,
} from 'lucide-react';

export default function ClientsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [clients, setClients] = useState<Client[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.clients.list({ search: search.trim() || undefined, limit: 50 });
      setClients(res.data);
      setTotalCount(res.meta.totalCount);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch client list.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchClients();
    }
  }, [authLoading, isAuthenticated, router, fetchClients]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setAddress('');
    setTaxId('');
    setNotes('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setAddress(client.address || '');
    setTaxId(client.taxId || '');
    setNotes(client.notes || '');
    setFormError(null);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim()) {
      setFormError('Client name and email address are required.');
      return;
    }

    try {
      setSaving(true);
      if (editingClient) {
        const payload: UpdateClientInput = {
          name: name.trim(),
          email: email.trim(),
          address: address.trim() || undefined,
          taxId: taxId.trim() || undefined,
          notes: notes.trim() || undefined,
        };
        await api.clients.update(editingClient.id, payload);
        setEditingClient(null);
      } else {
        const payload: CreateClientInput = {
          name: name.trim(),
          email: email.trim(),
          address: address.trim() || undefined,
          taxId: taxId.trim() || undefined,
          notes: notes.trim() || undefined,
        };
        await api.clients.create(payload);
        setIsCreateOpen(false);
      }
      resetForm();
      fetchClients();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save client.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deletingClient) return;
    try {
      setSaving(true);
      await api.clients.delete(deletingClient.id);
      setDeletingClient(null);
      fetchClients();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not delete client. Ensure no active invoices belong to this client.'
      );
      setDeletingClient(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Clients Directory
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage clients, billing contacts, and commercial entity tax identifiers.
              </p>
            </div>

            <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" />
              Add New Client
            </Button>
          </div>

          {error && (
            <Alert variant="error" title="Client Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Search bar */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white shadow-sm"
              />
            </div>
            <span className="text-xs text-slate-500">
              {totalCount} {totalCount === 1 ? 'client' : 'clients'} registered
            </span>
          </div>

          {/* Clients Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {search ? 'No clients match your search' : 'No clients added yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {search
                    ? 'Try searching with a different name or email address.'
                    : 'Add your first client to start drafting and issuing Stellar bills.'}
                </p>
                {!search && (
                  <div className="pt-2">
                    <Button onClick={handleOpenCreate} size="sm" className="gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      Add First Client
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Tax ID / Reg #</th>
                      <th className="px-6 py-3.5">Address</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                          <Building className="h-4 w-4 text-slate-400" />
                          {client.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {client.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {client.taxId || '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                          {client.address || '—'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(client)}
                            className="text-slate-600 hover:text-indigo-600"
                            title="Edit Client"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingClient(client)}
                            className="text-slate-600 hover:text-rose-600"
                            title="Delete Client"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingClient}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingClient(null);
          resetForm();
        }}
        title={editingClient ? 'Edit Client Details' : 'Add New Client'}
        description={
          editingClient
            ? 'Update billing entity and contact information.'
            : 'Register a new commercial client to receive invoices.'
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-4 pt-2">
          {formError && (
            <Alert variant="error" title="Validation Error">
              {formError}
            </Alert>
          )}

          <Input
            label="Client or Company Name"
            placeholder="e.g. Stellar Development Foundation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Billing Contact Email"
            type="email"
            placeholder="ap@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Tax ID / VAT Registration (Optional)"
            placeholder="e.g. US-123456789"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />

          <Textarea
            label="Billing Physical Address (Optional)"
            placeholder="123 Financial Way, Suite 400..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
          />

          <Textarea
            label="Internal Notes (Optional)"
            placeholder="Special billing terms, contacts, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            helperText="Internal notes are strictly private and never displayed on public pay portals."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingClient(null);
                resetForm();
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingClient ? 'Save Changes' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        title="Delete Client"
        description="Are you sure you want to remove this client?"
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-slate-600">
            You are about to delete <strong>{deletingClient?.name}</strong>. This action cannot be
            undone. If this client has active invoices, the backend will prohibit deletion.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeletingClient(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClient}
              isLoading={saving}
            >
              Delete Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
