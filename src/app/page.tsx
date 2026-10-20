'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  ShieldCheck,
  Zap,
  Lock,
  FileCheck2,
  ArrowRight,
  CheckCircle,
  Coins,
  Globe2,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>Stellar Protocol 22 &amp; Soroban Smart Contracts</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Decentralized billing for the{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  Stellar Ecosystem
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Issue tamper-evident, compliant commercial invoices with native XLM and Soroban
                smart contract settlement. Authoritative integer precision math, zero-trust backend
                verification, and instant PDF receipts.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/register">
                  <Button size="lg" className="gap-2 shadow-lg shadow-indigo-600/20 text-base px-6">
                    Start Invoicing Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-base px-6">
                    Merchant Sign In
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Zero floating-point rounding</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Freighter &amp; SEP-10 Auth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Authoritative Settlement</span>
                </div>
              </div>
            </div>

            {/* Interactive Fintech Invoice Preview Mock */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl ring-1 ring-slate-900/5 transition-all">
                {/* Decorative header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                      SB
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Acme Labs Ltd</h4>
                      <p className="text-[11px] text-slate-400">GDF7...9X12</p>
                    </div>
                  </div>
                  <Badge status="ISSUED" />
                </div>

                {/* Details */}
                <div className="py-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Invoice Number</span>
                    <span className="font-semibold text-slate-800">INV-2026-0042</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Billed To</span>
                    <span className="font-semibold text-slate-800">Horizon Cloud Inc</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Payment Network</span>
                    <span className="font-medium text-indigo-600">Stellar Testnet (XLM)</span>
                  </div>

                  {/* Line items sample */}
                  <div className="rounded-lg bg-slate-50 p-3 space-y-2 mt-2">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Soroban Smart Contract Audit</span>
                      <span className="font-medium">1,250.00 XLM</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Integration &amp; Testing (10 hrs)</span>
                      <span className="font-medium">750.00 XLM</span>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Subtotal</span>
                      <span>2,000.0000000 XLM</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Tax (5%)</span>
                      <span>100.0000000 XLM</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Amount Due</span>
                      <span className="text-indigo-600">2,100.0000000 XLM</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Payment Action */}
                <div className="pt-2">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-center">
                    <span className="text-xs font-medium text-indigo-900 block mb-2">
                      Ready for 1-click Freighter payment
                    </span>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" className="w-full text-xs font-semibold">
                        Pay 2,100 XLM via Wallet
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="border-t border-slate-200 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Architected for Enterprise Security
            </h2>
            <h3 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Engineered for the reality of Stellar settlement
            </h3>
            <p className="mt-4 text-slate-600">
              Unlike generic Web3 billing widgets, StellarBills provides rigorous monetary
              invariants, replay attack prevention, and tamper-evident audit trails.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-5">
                <Coins className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Zero Floating-Point Math</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                All quantities are represented as 4-decimal scaled integers and monetary balances as
                minor stroops. Floating-point arithmetic is strictly eliminated to prevent balance drift.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Zero-Trust Verification</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                The frontend never marks an invoice paid on its own. Every transaction is independently
                queried from Horizon or Soroban RPC and validated against database records.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Freighter &amp; SEP-10 Login</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Sign in with standard email credentials or use non-custodial Stellar wallet authentication
                via SEP-10 challenge-response signatures.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Cryptographic Capability URLs</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Public pay portals use 256-bit unguessable capability tokens (`/pay/[token]`). Internal
                merchant notes and database IDs are stripped from public payloads.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 mb-5">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Tamper-Evident PDF Engine</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Invoices compute an RFC 8785 canonical content hash. Generate and download clean,
                high-resolution PDFs suitable for corporate accounting and tax audits.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-5">
                <Globe2 className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Soroban Invoice Registry</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Optionally register on-chain commitments to the Soroban `InvoiceRegistry` smart contract
                deployed to Protocol 22 for decentralized dispute resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} StellarBills. Engineered for the Stellar Network.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Testnet Active
            </span>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">
              Register Merchant
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
