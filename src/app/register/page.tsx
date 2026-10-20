'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';
import { connectFreighter } from '../../lib/wallet';
import { UserPlus, ArrowLeft, Wallet, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stellarAddress, setStellarAddress] = useState('');
  const [fetchingWallet, setFetchingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFetchAddress = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!businessName || !email || !password || !stellarAddress) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must contain at least 8 characters.');
      return;
    }

    const cleanAddress = stellarAddress.trim();
    if (!cleanAddress.startsWith('G') || cleanAddress.length !== 56) {
      setErrorMessage('Please enter a valid 56-character Stellar public address starting with "G".');
      return;
    }

    try {
      setSubmitting(true);
      await registerWithEmail(email, password, businessName, cleanAddress);
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
            SB
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Create your Merchant Account
          </h2>
          <p className="text-sm text-slate-500">
            Start issuing professional invoices settled directly to your Stellar wallet.
          </p>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Registration Failed" onDismiss={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <Card className="shadow-lg border-slate-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Merchant Profile</CardTitle>
            <CardDescription>
              Provide your business identity and designated receiving address.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Business or Organization Name"
                placeholder="e.g. Acme Web3 Solutions"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="billing@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password (min 8 characters)"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Stellar Receiving Address (Public Key)
                  </label>
                  <button
                    type="button"
                    onClick={handleFetchAddress}
                    disabled={fetchingWallet}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    <Wallet className="h-3.5 w-3.5" />
                    {fetchingWallet ? 'Connecting...' : 'Autofill from Freighter'}
                  </button>
                </div>
                <Input
                  placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  value={stellarAddress}
                  onChange={(e) => setStellarAddress(e.target.value)}
                  required
                  helperText="Settlements from client invoices will be directed to this Stellar account."
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full gap-2 shadow-sm" isLoading={submitting}>
                  <UserPlus className="h-4 w-4" />
                  Create Merchant Account
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 text-xs text-slate-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5"
            >
              <ArrowLeft className="h-3 w-3" />
              Sign in here
            </Link>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Non-custodial: Your private keys never touch our servers</span>
        </div>
      </div>
    </div>
  );
}
