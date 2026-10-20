import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/auth-context';
import { Navbar } from '../components/layout/navbar';

export const metadata: Metadata = {
  title: 'StellarBills — Decentralized Invoicing for Stellar & Soroban',
  description:
    'Issue tamper-evident, compliant invoices with native Stellar XLM and Soroban token settlement, zero-trust verification, and instant PDF generation.',
  keywords: [
    'Stellar',
    'Soroban',
    'Invoicing',
    'Crypto Invoices',
    'XLM',
    'Freighter',
    'Smart Contracts',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
