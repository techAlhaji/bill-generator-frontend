'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { api } from '../../lib/api';
import { Sidebar } from '../../components/layout/sidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert } from '../../components/ui/alert';
import { connectFreighter } from '../../lib/wallet';
import {
  Settings,
  Shield,
  Wallet,
  CheckCircle2,
  Copy,
  ExternalLink,
  Save,
  Globe,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { merchant, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [stellarAddress, setStellarAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetchingWallet, setFetchingWallet] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (merchant) {
      setBusinessName(merchant.businessName || '');
      setStellarAddress(merchant.stellarAddress || '');
    }
  }, [authLoading, isAuthenticated, merchant, router]);

  const handleFetchFromFreighter = async () => {
    try {
      setFetchingWallet(true);
      setErrorMessage(null);
      const conn = await connectFreighter();
      setStellarAddress(conn.address);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to connect to Freighter wallet.'
      );
    } finally {
      setFetchingWallet(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = businessName.trim();
    const cleanAddress = stellarAddress.trim();

    if (cleanName.length < 2) {
      setErrorMessage('Business name must be at least 2 characters.');
      return;
    }

    if (cleanAddress && (!cleanAddress.startsWith('G') || cleanAddress.length !== 56)) {
      setErrorMessage('Please enter a valid 56-character Stellar public address starting with "G".');
      return;
    }

    try {
      setSaving(true);
      await api.merchant.updateProfile({
        businessName: cleanName,
        stellarAddress: cleanAddress || undefined,
      });
      await refreshProfile();
      setSuccessMessage('Merchant profile and receiving address successfully updated.');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to save merchant settings.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const horizonUrl = process.env.NEXT_PUBLIC_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const sorobanRpcUrl =
    process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
  const networkPassphrase =
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';
  const contractId =
    process.env.NEXT_PUBLIC_INVOICE_REGISTRY_CONTRACT_ID || 'CA... (Soroban InvoiceRegistry)';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="lg:pl-64 flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Account &amp; Network Settings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure your merchant business identity and Stellar receiving preferences.
            </p>
          </div>

          {successMessage && (
            <Alert variant="success" title="Settings Saved" onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="error" title="Settings Error" onDismiss={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Merchant Profile</CardTitle>
              <CardDescription>
                Public organization information displayed on your issued invoices and payment links.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input
                  label="Registered Email Address"
                  value={merchant?.email || ''}
                  disabled
                  helperText="Primary contact and login email (immutable)."
                />

                <Input
                  label="Business or Organization Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Web3 Solutions"
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">
                      Stellar Receiving Address (Public Key)
                    </label>
                    <button
                      type="button"
                      onClick={handleFetchFromFreighter}
                      disabled={fetchingWallet}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {fetchingWallet ? 'Connecting...' : 'Autofill from Freighter'}
                    </button>
                  </div>
                  <Input
                    value={stellarAddress}
                    onChange={(e) => setStellarAddress(e.target.value)}
                    placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    required
                    helperText="All client payments are cryptographically verified to arrive at this address."
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" className="gap-2" isLoading={saving}>
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Network & RPC Configuration Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-indigo-600" />
                    Stellar Network Configuration
                  </CardTitle>
                  <CardDescription>
                    Active consensus and RPC nodes utilized for payment settlement verification.
                  </CardDescription>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Stellar Testnet
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Network Passphrase
                  </span>
                  <div className="flex items-center justify-between rounded bg-white px-3 py-1.5 border border-slate-200">
                    <code className="text-slate-800 font-mono text-[11px] truncate">
                      {networkPassphrase}
                    </code>
                    <button
                      onClick={() => handleCopy(networkPassphrase, 'passphrase')}
                      className="text-slate-400 hover:text-slate-600 ml-2"
                      title="Copy Passphrase"
                    >
                      {copiedKey === 'passphrase' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Horizon REST Endpoint
                  </span>
                  <div className="flex items-center justify-between rounded bg-white px-3 py-1.5 border border-slate-200">
                    <code className="text-slate-800 font-mono text-[11px] truncate">
                      {horizonUrl}
                    </code>
                    <button
                      onClick={() => handleCopy(horizonUrl, 'horizon')}
                      className="text-slate-400 hover:text-slate-600 ml-2"
                      title="Copy Horizon URL"
                    >
                      {copiedKey === 'horizon' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Soroban RPC Endpoint
                  </span>
                  <div className="flex items-center justify-between rounded bg-white px-3 py-1.5 border border-slate-200">
                    <code className="text-slate-800 font-mono text-[11px] truncate">
                      {sorobanRpcUrl}
                    </code>
                    <button
                      onClick={() => handleCopy(sorobanRpcUrl, 'soroban')}
                      className="text-slate-400 hover:text-slate-600 ml-2"
                      title="Copy Soroban RPC URL"
                    >
                      {copiedKey === 'soroban' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Soroban InvoiceRegistry Contract
                  </span>
                  <div className="flex items-center justify-between rounded bg-white px-3 py-1.5 border border-slate-200">
                    <code className="text-slate-800 font-mono text-[11px] truncate">
                      {contractId}
                    </code>
                    <button
                      onClick={() => handleCopy(contractId, 'contract')}
                      className="text-slate-400 hover:text-slate-600 ml-2"
                      title="Copy Contract ID"
                    >
                      {copiedKey === 'contract' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
