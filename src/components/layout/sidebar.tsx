'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  PlusCircle,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { Button } from '../ui/button';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 border-r border-slate-200 bg-white">
      <div className="flex flex-col flex-grow px-4 py-6 overflow-y-auto justify-between">
        <div className="space-y-6">
          <div>
            <Link href="/invoices/new" className="block w-full">
              <Button className="w-full gap-2 shadow-sm font-medium">
                <PlusCircle className="h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Manage
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(`${item.href}`));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Network & Protocol Status Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Stellar Protocol 22</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Connected to Stellar Testnet Horizon &amp; Soroban RPC with zero-trust backend settlement.
          </p>
          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Horizon Node</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
