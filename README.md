# StellarBills — Frontend Application

Production-grade decentralized billing and commercial invoicing frontend for the Stellar Network and Soroban Protocol 22 smart contracts.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Vitest**, and official Stellar SDKs.

---

## Features & Implemented Pages

1. **Landing Page (`/`):** High-converting fintech product showcase with features, architecture highlights, interactive mock preview, and trust badges.
2. **Sign-In (`/login`):** Dual authentication options supporting standard email/password or Web3 non-custodial login via Stellar SEP-10 challenge-response signatures.
3. **Registration (`/register`):** Merchant onboarding with business identity and designated Stellar receiving address (with 1-click Freighter autofill).
4. **Merchant Dashboard (`/dashboard`):** Real-time financial statistics (total invoiced volume, settled payments, pending balances, overdue counts) and recent invoices table.
5. **Invoice Management (`/invoices`):** Filterable, searchable, and paginated invoice table supporting status filtering (`DRAFT`, `ISSUED`, `PAID`, `OVERDUE`, `CANCELLED`) and currency filtering (`NATIVE_XLM`, `STELLAR_CLASSIC`, `SOROBAN_TOKEN`).
6. **Create Invoice Form (`/invoices/new`):** Dynamic line items authoring, client selector, quantity scaled by $10^4$, integer unit prices, real-time authoritative preview calculations, and instant issuance.
7. **Edit Draft Invoice (`/invoices/[id]/edit`):** In-place editing guarded strictly to `DRAFT` status.
8. **Invoice Detail (`/invoices/[id]`):** Complete invoice metadata, payment status, audit trail, cryptographic content digest, PDF download, and lifecycle actions (`Issue`, `Cancel`).
9. **Print-Ready Preview (`/invoices/[id]/preview`):** Business-grade printable invoice sheet optimized for `@media print` and PDF export.
10. **Public Pay Portal (`/pay/[token]`):** Capability URL for payers. Scrubs private merchant notes and database IDs. Real-time status polling every 4 seconds.
11. **Stellar Wallet Payment Modal:** Connects Freighter, verifies network passphrase (`Test SDF Network ; September 2015`), displays pre-transaction review parameters, signs transaction, submits to Horizon, and validates via zero-trust backend cryptographic verification.
12. **Client Management CRM (`/clients`):** Searchable client directory, add/edit client modal with entity tax ID, address, and notes.
13. **Account & Network Settings (`/settings`):** Merchant profile editing, receiving address updates, and network node diagnostics (Horizon, Soroban RPC, InvoiceRegistry contract ID).

---

## Architectural & Mathematical Principles

- **Zero Floating-Point Arithmetic:** All balances are computed in integer minor units (stroops for XLM, cents for stablecoins). Quantities use integer scale $10^4$ (`10000 = 1.0000`).
- **Zero-Trust Payment Settlement:** Client applications never mark an invoice `PAID` based solely on a wallet response. The backend independently inspects the Stellar ledger via Horizon / Soroban RPC (`POST /api/v1/public/invoices/:token/verify-payment`).
- **RFC 8785 Canonical Hashing:** Content digests are computed mathematically matching the on-chain Soroban contract commitments.
- **SSR-Safe Wallet Extension Access:** Freighter and window extension bindings are dynamically loaded inside browser-only contexts to prevent hydration mismatches.
- **RFC 7807 Problem Details:** Unified API error normalization with actionable feedback for users.

---

## Technology Stack & Dependencies

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `^15.1.7` | React 19 framework with App Router & Server Components |
| `react` / `react-dom` | `^19.0.0` | Core UI engine |
| `@stellar/stellar-sdk` | `^13.0.0` | Transaction builder, Horizon client, Asset modeling |
| `@stellar/freighter-api`| `^6.0.1` | Non-custodial Stellar wallet connector & SEP-10 signer |
| `tailwindcss` | `^3.4.17` | Utility-first responsive fintech styling |
| `lucide-react` | `^0.475.0` | Accessible iconography system |
| `vitest` | `^3.0.5` | Fast unit & component test runner |
| `@testing-library/react` | `^16.2.0` | Component DOM testing utilities |

---

## Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Default (Local Testnet) |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend REST API endpoint | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Target blockchain network | `TESTNET` |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | Stellar network passphrase | `Test SDF Network ; September 2015` |
| `NEXT_PUBLIC_HORIZON_URL` | Stellar Horizon node | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_INVOICE_REGISTRY_CONTRACT_ID` | Soroban Registry Contract | `CA...` |

---

## Local Development & Validation Commands

All commands can be run from `bill-generator-frontend`:

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Run TypeScript typecheck (zero errors)
npm run typecheck

# Run automated unit and component test suite
npm test

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## Continuous Integration

The repository includes a GitHub Actions workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) that executes:
1. `npm ci`
2. `npm run typecheck`
3. `npm test`
4. `npm run build`
