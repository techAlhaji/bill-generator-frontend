'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/auth-context';
import { Button } from '../ui/button';
import {
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { merchant, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on public pay portal, render a minimal clean header
  const isPublicPayPage = pathname?.startsWith('/pay/');

  if (isPublicPayPage) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20">
              SB
            </div>
            <span className="font-semibold text-lg text-slate-900 tracking-tight">StellarBills</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Payment Portal
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Testnet
            </span>
          </div>
        </div>
      </header>
    );
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/clients', label: 'Clients', icon: Users },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20">
              SB
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight text-slate-900 tracking-tight">
                StellarBills
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                Fintech Invoicing
              </span>
            </div>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            Stellar Testnet
          </span>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/invoices/new" className="hidden sm:inline-flex">
                <Button size="sm" className="gap-1.5 shadow-sm">
                  <CreditCard className="h-4 w-4" />
                  New Invoice
                </Button>
              </Link>
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                  {merchant?.businessName}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                  {merchant?.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-rose-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-slate-100 mt-2">
            <Link
              href="/invoices/new"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full"
            >
              <Button className="w-full">New Invoice</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
