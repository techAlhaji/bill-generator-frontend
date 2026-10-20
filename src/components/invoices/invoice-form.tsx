'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Client, Invoice, CreateInvoiceInput, UpdateInvoiceInput, CurrencyType } from '../../types';
import { api } from '../../lib/api';
import {
  parseDecimalToMinor,
  formatMinorToDecimal,
  parseQuantityToScale4,
  formatScale4ToQuantity,
  computeLineItemTotal,
  computeInvoiceTotals,
  formatCurrency,
} from '../../lib/math';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Alert } from '../ui/alert';
import { Plus, Trash2, Save, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface LineItemFormState {
  id: string;
  description: string;
  quantityStr: string;
  unitPriceStr: string;
}

interface InvoiceFormProps {
  initialInvoice?: Invoice;
  isEditing?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialInvoice, isEditing = false }) => {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Form fields
  const [clientId, setClientId] = useState(initialInvoice?.clientId || '');
  const [invoiceNumber, setInvoiceNumber] = useState(initialInvoice?.invoiceNumber || '');
  const [currencyType, setCurrencyType] = useState<CurrencyType>(
    initialInvoice?.currencyType || 'NATIVE_XLM'
  );
  const [assetCode, setAssetCode] = useState(initialInvoice?.assetCode || 'XLM');
  const [assetIssuer, setAssetIssuer] = useState(initialInvoice?.assetIssuer || '');
  const [tokenContractId, setTokenContractId] = useState(initialInvoice?.tokenContractId || '');

  const todayStr = new Date().toISOString().split('T')[0];
  const in30DaysStr = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [issueDate, setIssueDate] = useState(initialInvoice?.issueDate || todayStr);
  const [dueDate, setDueDate] = useState(initialInvoice?.dueDate || in30DaysStr);
  const [taxPercentStr, setTaxPercentStr] = useState(
    initialInvoice ? (initialInvoice.taxRateBps / 100).toString() : '0'
  );
  const [discountStr, setDiscountStr] = useState(
    initialInvoice ? formatMinorToDecimal(initialInvoice.discountMinor, 7, true) : '0'
  );
  const [notes, setNotes] = useState(initialInvoice?.notes || '');

  // Line items
  const [items, setItems] = useState<LineItemFormState[]>(() => {
    if (initialInvoice && initialInvoice.items.length > 0) {
      return initialInvoice.items.map((item, idx) => ({
        id: item.id || `item-${idx}`,
        description: item.description,
        quantityStr: formatScale4ToQuantity(item.quantityScale4),
        unitPriceStr: formatMinorToDecimal(item.unitPriceMinor, 7, true),
      }));
    }
    return [
      {
        id: 'item-1',
        description: '',
        quantityStr: '1',
        unitPriceStr: '100',
      },
    ];
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.clients.list({ limit: 100 });
        setClients(res.data);
        if (!clientId && res.data.length > 0) {
          setClientId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load clients', err);
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, [clientId]);

  // Handle line items
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantityStr: '1',
        unitPriceStr: '0',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItemFormState, value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Preview Totals calculation
  const taxRateBps = Math.min(10_000, Math.max(0, Math.round(parseFloat(taxPercentStr || '0') * 100)));
  const discountMinor = parseDecimalToMinor(discountStr || '0', 7).toString();

  const parsedItemsForCalculation = items.map((it) => ({
    quantityScale4: parseQuantityToScale4(it.quantityStr),
    unitPriceMinor: parseDecimalToMinor(it.unitPriceStr || '0', 7).toString(),
  }));

  const previewTotals = computeInvoiceTotals(
    parsedItemsForCalculation,
    taxRateBps,
    discountMinor
  );

  const handleSubmit = async (e: React.FormEvent, issueDirectly: boolean = false) => {
    e.preventDefault();
    setFormError(null);

    if (!clientId) {
      setFormError('Please select a client for this invoice.');
      return;
    }

    if (new Date(dueDate) < new Date(issueDate)) {
      setFormError('Due date cannot precede issue date.');
      return;
    }

    // Validate line items
    for (let i = 0; i < items.length; i++) {
      if (!items[i].description.trim()) {
        setFormError(`Item #${i + 1} must have a description.`);
        return;
      }
    }

    const payloadItems = items.map((it) => ({
      description: it.description.trim(),
      quantityScale4: parseQuantityToScale4(it.quantityStr),
      unitPriceMinor: parseDecimalToMinor(it.unitPriceStr || '0', 7).toString(),
    }));

    try {
      setSubmitting(true);

      let invoiceId = initialInvoice?.id;

      if (isEditing && invoiceId) {
        const updatePayload: UpdateInvoiceInput = {
          clientId,
          currencyType,
          assetCode,
          assetIssuer: currencyType === 'STELLAR_CLASSIC' ? assetIssuer : null,
          tokenContractId: currencyType === 'SOROBAN_TOKEN' ? tokenContractId : null,
          taxRateBps,
          discountMinor,
          notes: notes.trim() || null,
          issueDate,
          dueDate,
          items: payloadItems,
        };
        const res = await api.invoices.update(invoiceId, updatePayload);
        invoiceId = res.data.id;
      } else {
        const createPayload: CreateInvoiceInput = {
          clientId,
          invoiceNumber: invoiceNumber.trim() || undefined,
          currencyType,
          assetCode,
          assetIssuer: currencyType === 'STELLAR_CLASSIC' ? assetIssuer : null,
          tokenContractId: currencyType === 'SOROBAN_TOKEN' ? tokenContractId : null,
          taxRateBps,
          discountMinor,
          notes: notes.trim() || null,
          issueDate,
          dueDate,
          items: payloadItems,
        };
        const res = await api.invoices.create(createPayload);
        invoiceId = res.data.id;
      }

      if (issueDirectly && invoiceId) {
        await api.invoices.issue(invoiceId);
      }

      router.push(`/invoices/${invoiceId}`);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
      {formError && (
        <Alert variant="error" title="Validation Error" onDismiss={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      {/* Basic Invoice Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Metadata</CardTitle>
          <CardDescription>
            Specify recipient, invoice numbering, and settlement asset.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Client</label>
              {loadingClients ? (
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ) : clients.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  No clients available.{' '}
                  <Link href="/clients" className="underline font-semibold">
                    Create a client
                  </Link>{' '}
                  first.
                </div>
              ) : (
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <Input
              label="Invoice Number (Optional - Auto-assigned if blank)"
              placeholder="e.g. INV-2026-0001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={isEditing}
            />

            <Input
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />

            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          {/* Currency / Settlement Asset */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Currency Protocol</label>
              <select
                value={currencyType}
                onChange={(e) => {
                  const val = e.target.value as CurrencyType;
                  setCurrencyType(val);
                  if (val === 'NATIVE_XLM') {
                    setAssetCode('XLM');
                  }
                }}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="NATIVE_XLM">Stellar Native Lumens (XLM)</option>
                <option value="STELLAR_CLASSIC">Stellar Classic Trustline Asset</option>
                <option value="SOROBAN_TOKEN">Soroban Smart Contract Token (SEP-41)</option>
              </select>
            </div>

            <Input
              label="Asset Code"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              disabled={currencyType === 'NATIVE_XLM'}
              required
            />

            {currencyType === 'STELLAR_CLASSIC' && (
              <Input
                label="Asset Issuer (G...)"
                placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={assetIssuer}
                onChange={(e) => setAssetIssuer(e.target.value)}
                required
              />
            )}

            {currencyType === 'SOROBAN_TOKEN' && (
              <Input
                label="Soroban Contract ID (C...)"
                placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={tokenContractId}
                onChange={(e) => setTokenContractId(e.target.value)}
                required
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>
                Add goods, professional services, or consulting deliverables.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => {
              const lineTotal = computeLineItemTotal(
                parseQuantityToScale4(item.quantityStr),
                parseDecimalToMinor(item.unitPriceStr || '0', 7).toString()
              );

              return (
                <div
                  key={item.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
                >
                  <div className="flex-1 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Item description (e.g. Protocol 22 Smart Contract Audit)"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="w-full md:w-28">
                    <input
                      type="number"
                      step="any"
                      min="0.0001"
                      placeholder="Qty"
                      value={item.quantityStr}
                      onChange={(e) => handleItemChange(index, 'quantityStr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="w-full md:w-36">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="Price"
                      value={item.unitPriceStr}
                      onChange={(e) => handleItemChange(index, 'unitPriceStr', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>

                  <div className="w-full md:w-36 text-right font-medium text-sm text-slate-800 py-2 md:py-0">
                    {formatCurrency(lineTotal, assetCode)}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                    className="text-slate-400 hover:text-rose-600 disabled:opacity-30 p-2"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Tax, Discount & Totals Section */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxPercentStr}
                  onChange={(e) => setTaxPercentStr(e.target.value)}
                  helperText="Calculated with half-up rounding"
                />

                <Input
                  label={`Discount (${assetCode})`}
                  type="number"
                  step="any"
                  min="0"
                  value={discountStr}
                  onChange={(e) => setDiscountStr(e.target.value)}
                  helperText="Fixed deduction before tax"
                />
              </div>

              <Textarea
                label="Payment Terms / Notes (Optional)"
                placeholder="Net 30. Please settle invoice using designated public pay portal."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Authoritative Totals Preview Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(previewTotals.subtotalMinor, assetCode)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span className="font-medium text-rose-600">
                  -{formatCurrency(previewTotals.discountMinor, assetCode)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({taxPercentStr || 0}%)</span>
                <span className="font-medium">
                  +{formatCurrency(previewTotals.taxMinor, assetCode)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>Authoritative Total</span>
                <span className="text-indigo-600">
                  {formatCurrency(previewTotals.totalMinor, assetCode)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Calculated strictly in integer minor units (0-float drift guaranteed).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/invoices">
          <Button variant="outline" type="button" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <Button type="submit" variant="outline" className="gap-2" isLoading={submitting}>
            <Save className="h-4 w-4" />
            {isEditing ? 'Save Changes' : 'Save as Draft'}
          </Button>

          {!isEditing && (
            <Button
              type="button"
              className="gap-2 shadow-sm"
              isLoading={submitting}
              onClick={(e) => handleSubmit(e, true)}
            >
              <Send className="h-4 w-4" />
              Save &amp; Issue Now
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
