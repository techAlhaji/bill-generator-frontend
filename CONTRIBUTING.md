# Contributing to StellarBills Frontend

Thank you for your interest in contributing to the **StellarBills Web Application**. This repository contains the commercial invoicing dashboard, public capability payment portal, print stylesheets, and non-custodial Stellar wallet integration built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and official Stellar SDKs.

Follow these rules to contribute.

---

## 1. Claiming an Issue

We follow an issue-first workflow:
1. Check the [Issues Tab](https://github.com/techAlhaji/bill-generator-frontend/issues) for open tasks.
2. Comment `.take` on the unassigned issue you wish to build.
3. Wait for assignment before opening a pull request.
4. Avoid submitting uncoordinated UI redesigns or pull requests without a linked issue.

### Complexity Tiers

| Label | Scope | Estimated Effort |
| :--- | :--- | :--- |
| `complexity:low` | UI copy tweaks, accessibility enhancements, component test additions | < 2 hours |
| `complexity:medium` | New form validations, filter components, print layout optimizations | 2–5 hours |
| `complexity:high` | Wallet integration refactoring, multi-wallet kit, state caching | > 5 hours |

---

## 2. Local Development & Testing

### Prerequisites
- **Node.js:** `v22+`
- **npm:** `v10+`
- **Browser Wallet Extension:** [Freighter Wallet](https://www.freighter.app/) configured for Stellar Testnet

### Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# 3. Start local development server (port 3000)
npm run dev
```

### Local Verification Commands
Before opening a PR, all three checks must pass:

```bash
# 1. Typecheck TypeScript strictly
npm run typecheck

# 2. Run unit and component test suite
npm test

# 3. Test production Next.js build
npm run build
```

---

## 3. Frontend & Architecture Standards

1. **Zero-Float Math:** All unit prices, quantities, and balances in component forms must be converted to/from minor units and scaled integers using the utility functions in `src/lib/math.ts`. Never perform monetary math with standard JavaScript floating point numbers.
2. **SSR-Safe Wallet Extension Access:** `window.freighter` or browser extensions must be accessed exclusively inside client-side components (`"use client"`) and within `useEffect` or event handlers to avoid SSR hydration mismatches.
3. **Zero-Trust Payment Flow:** The UI must display payment status based on verification responses from `POST /api/v1/public/invoices/:token/verify-payment`. Do not update status optimistically without backend confirmation.
4. **Accessible Semantics:** All buttons, form fields, and modal dialogs must include descriptive `aria-label` or accessible names for screen readers.
5. **Print Stylesheet Integrity:** Changes to `/invoices/[id]/preview` must preserve the clean `@media print` layout without clipping table boundaries.

---

## 4. Git & Commit Guidelines

- **Branch Naming:**
  - `feat/issue-<number>-short-description`
  - `fix/issue-<number>-short-description`
- **Conventional Commits:**
  - `feat(frontend): add dark mode toggle with Tailwind theme classes`
  - `fix(frontend): handle transaction timeout in Freighter modal`
  - `test(frontend): add test for invoice line item calculation`
- **Atomic Commits:** One logical commit per change.

---

## 5. Pull Request Process

1. Open a Pull Request targeting `main`.
2. Link the issue in the body: `Closes #<issue_number>`.
3. Verify that the `Lint, Test & Build Frontend` GitHub Actions CI job passes.
4. Address review feedback promptly.
