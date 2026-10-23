<p align="center">
  <img src="https://raw.githubusercontent.com/techAlhaji/bill-generator-frontend/main/public/images/banner.png" alt="StellarBills Logo" width="640" onerror="this.style.display='none'" />
</p>

<h1 align="center">StellarBills — Frontend Application</h1>

<p align="center">
  <strong>Decentralized commercial invoicing dashboard, public capability payment portal, and Stellar wallet integration for Next.js 15.</strong>
</p>

<p align="center">
  <a href="https://github.com/techAlhaji/bill-generator-frontend/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/techAlhaji/bill-generator-frontend/ci.yml?branch=main&label=CI%20Build" alt="CI Build" />
  </a>
  <img src="https://img.shields.io/badge/Next.js-15.1-black.svg" alt="Next.js 15.1" />
  <img src="https://img.shields.io/badge/React-19.0-blue.svg" alt="React 19.0" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript 5.7" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg" alt="Tailwind CSS 3.4" />
  <img src="https://img.shields.io/badge/Stellar%20SDK-v13-blueviolet.svg" alt="Stellar SDK v13" />
  <a href="https://techalhaji.github.io/bill-generator-frontend/">
    <img src="https://img.shields.io/badge/Docs-StellarBills%20Portal-00E5FF?style=flat&logo=gitbook&logoColor=white" alt="Unified Documentation Portal" />
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-Apache%202.0-green.svg" alt="License" />
  </a>
</p>

> 📖 **Live Documentation Portal:** Explore the unified documentation for all three repositories (Smart Contracts, Backend API, and Frontend App) at **[https://techalhaji.github.io/bill-generator-frontend/](https://techalhaji.github.io/bill-generator-frontend/)**.

---

## 1. What is StellarBills Frontend?

**StellarBills** is a modern commercial invoicing and payment platform tailored for businesses, contractors, and freelancers operating on the Stellar network.

### Key Capabilities
- **High-Converting Fintech Dashboard:** Real-time billing metrics (invoiced volume, settled amounts, overdue alerts), paginated invoice tables, and customer CRM directory.
- **Dynamic Invoice Creator:** Multi-line item invoice authoring with zero-float integer math (quantities scaled by $10^4$, prices in minor units/stroops), basis-points tax computation, and live preview rendering.
- **Public Capability Pay Portal (`/pay/[token]`):** Secure, shareable capability links allowing payers to review and settle invoices with zero account registration. Internal merchant notes and database IDs are stripped for privacy.
- **Non-Custodial Wallet Payment Modal:** Direct non-custodial checkout supporting Freighter, checking network passphrase (`Test SDF Network ; September 2015`), displaying pre-flight parameters, and dispatching transaction envelopes to Stellar Horizon.
- **Zero-Trust Settlement Feedback:** UI status transitions are strictly gated by independent server-side verification against Horizon and Soroban RPC nodes.
- **Print & PDF Engine:** Business-grade printable stylesheets (`@media print`) and direct integration with backend vector PDF generation.

---

## 2. Maintainers

| Avatar | Maintainer | Role | Contact |
| :---: | :--- | :--- | :--- |
| <img src="https://github.com/techAlhaji.png" width="48" height="48" style="border-radius:50%;" /> | **Ademola (@techAlhaji)** | Lead Frontend Engineer | [`ademolabuild@gmail.com`](mailto:ademolabuild@gmail.com) / GitHub: [@techAlhaji](https://github.com/techAlhaji) |

---

## 3. Technology Stack & Dependencies

| Dependency | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `^15.1.7` | Next.js App Router, Server Components, Route Handlers |
| `react` / `react-dom` | `^19.0.0` | UI component library |
| `@stellar/stellar-sdk` | `^13.0.0` | Stellar Horizon client, asset modeling, XDR encoding |
| `@stellar/freighter-api`| `^6.0.1` | Non-custodial browser wallet connection & transaction signing |
| `tailwindcss` | `^3.4.17` | Utility-first responsive fintech styling |
| `lucide-react` | `^0.475.0` | Accessible iconography system |
| `vitest` | `^3.0.5` | Fast unit & component testing |
| `@testing-library/react` | `^16.2.0` | React component DOM testing utilities |

---

## 4. Implemented Pages & Routes

| Route | Page Name | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Landing Showcase | Public | Product showcase, features overview, trust indicators |
| `/login` | Authentication | Public | Dual login (email/password or non-custodial SEP-10 wallet challenge) |
| `/register` | Merchant Onboarding | Public | Business profile registration with Freighter address autofill |
| `/dashboard` | Dashboard Overview | Merchant | Aggregated financial volume, recent invoices, quick actions |
| `/invoices` | Invoices Directory | Merchant | Filterable, searchable, paginated table of merchant invoices |
| `/invoices/new` | Invoice Authoring | Merchant | Dynamic line items form with live integer calculations |
| `/invoices/[id]` | Invoice Detail | Merchant | Full metadata, lifecycle actions (Issue, Cancel), PDF download |
| `/invoices/[id]/preview` | Printable Sheet | Merchant | Print-ready invoice sheet optimized for `@media print` |
| `/pay/[token]` | Capability Portal | Public Payer | Shareable capability URL for non-custodial wallet payment |
| `/clients` | Client CRM | Merchant | Client entity directory with tax IDs and currency preferences |
| `/settings` | Settings & Diagnostic | Merchant | Receiving address updates and live Stellar RPC node status |

---

## 5. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Environment Variable | Description | Default (Testnet) |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend REST API endpoint | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_STELLAR_NETWORK` | Stellar network environment | `TESTNET` |
| `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE` | Network passphrase | `Test SDF Network ; September 2015` |
| `NEXT_PUBLIC_HORIZON_URL` | Horizon node URL | `https://horizon-testnet.stellar.org` |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | Soroban RPC endpoint | `https://soroban-testnet.stellar.org` |
| `NEXT_PUBLIC_INVOICE_REGISTRY_CONTRACT_ID` | Soroban Registry Contract Address | `CCG6V5QEJZ2QI7EXIRVQXCHUIFUROXUBMZPTSCRJHOO35CAQ2HZ6IJGC` |

---

## 6. Quick-Start & Development Setup

### Prerequisites
- Node.js v22+
- npm v10+
- Browser with [Freighter Wallet](https://www.freighter.app/) extension

```bash
# 1. Clone repository
git clone https://github.com/techAlhaji/bill-generator-frontend.git
cd bill-generator-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local

# 4. Start local development server (port 3000)
npm run dev

# 5. Typecheck and run automated tests
npm run typecheck
npm test

# 6. Build production bundle
npm run build
```

---

## 7. Directory Structure

```
bill-generator-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated TypeScript typecheck, tests & Next.js build
├── app/                         # Next.js 15 App Router
│   ├── (auth)/                  # Login & registration routes
│   ├── (dashboard)/             # Protected merchant dashboard & CRM routes
│   ├── pay/[token]/             # Sanitized public capability pay portal
│   ├── layout.tsx               # Root layout & providers
│   └── page.tsx                 # High-converting landing showcase
├── components/                  # Reusable UI component library
│   ├── auth/                    # SEP-10 & credentials auth forms
│   ├── common/                  # Navbar, footer, modal dialogs, status badges
│   ├── dashboard/               # Stat cards, quick action links
│   ├── invoices/                # Line items table, status filters, payment modal
│   └── ui/                      # Base primitives (button, badge, input, card)
├── lib/
│   ├── api.ts                   # Backend REST API client wrappers
│   ├── math.ts                  # Zero-float integer monetary calculations
│   └── stellar.ts               # Freighter wallet connector & Horizon builders
├── scripts/
│   └── create_issues.sh         # gh script for automated community issue creation
├── tests/                       # Automated Vitest component and logic tests
├── CONTRIBUTING.md              # Issue claiming workflow (.take) and guidelines
├── SECURITY.md                  # Responsible disclosure policy and disclaimer
└── README.md
```

---

## 8. Contributing & Security

- **Contributing:** Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening PRs. All contributions require an assigned issue and conventional commit format.
- **Security:** Review [SECURITY.md](./SECURITY.md) for non-custodial security disclosures.

---

## 9. Contributors

Thanks to all contributors building with StellarBills!

<a href="https://github.com/techAlhaji/bill-generator-frontend/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=techAlhaji/bill-generator-frontend" alt="Contributors" />
</a>

---

## 10. License

This repository is licensed under the [Apache License 2.0](./LICENSE).
