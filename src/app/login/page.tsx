'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Alert } from '../../components/ui/alert';
import { Wallet, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithEmail, loginWithStellarWallet, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    try {
      setLoadingEmail(true);
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleWalletLogin = async () => {
    setErrorMessage(null);
    try {
      setLoadingWallet(true);
      await loginWithStellarWallet();
      router.push('/dashboard');
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Wallet authentication failed. Please try again.'
      );
    } finally {
      setLoadingWallet(false);
    }
  };

  const isExpired = searchParams.get('expired') === 'true';

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
          SB
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back to StellarBills
        </h2>
        <p className="text-sm text-slate-500">
          Sign in to manage invoices, clients, and automated settlements.
        </p>
      </div>

      {isExpired && (
        <Alert variant="warning" title="Session Expired">
          Your previous session has expired. Please sign in again to continue.
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="error" title="Authentication Error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Merchant Credentials</CardTitle>
          <CardDescription>
            Use your registered email and password to access your dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full gap-2 shadow-sm"
              isLoading={loadingEmail}
              disabled={loadingWallet}
            >
              <LogIn className="h-4 w-4" />
              Sign In with Email
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold">Or continue with Web3</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-indigo-200 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-800"
            onClick={handleWalletLogin}
            isLoading={loadingWallet}
            disabled={loadingEmail}
          >
            <Wallet className="h-4 w-4 text-indigo-600" />
            Sign In with Freighter (SEP-10)
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 pt-4 text-xs text-slate-500">
          Don&apos;t have a merchant account?{' '}
          <Link
            href="/register"
            className="ml-1 font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5"
          >
            Register here
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardFooter>
      </Card>

      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Protected by Stellar SEP-10 Cryptographic Challenge Verification</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
