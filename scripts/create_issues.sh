#!/usr/bin/env bash
# scripts/create_issues.sh
# Automates bulk issue creation for techAlhaji/bill-generator-frontend using GitHub CLI (gh)

set -e

REPO="techAlhaji/bill-generator-frontend"

echo "Creating labels on $REPO..."
gh label create "complexity:low" --repo "$REPO" --color "0E8A16" --description "Good for newcomers, < 2 hours" --force || true
gh label create "complexity:medium" --repo "$REPO" --color "FBCA04" --description "Moderate complexity, 2-5 hours" --force || true
gh label create "complexity:high" --repo "$REPO" --color "D93F0B" --description "High complexity architectural task, > 5 hours" --force || true
gh label create "type:feat" --repo "$REPO" --color "1D76DB" --description "New feature or capability" --force || true
gh label create "type:test" --repo "$REPO" --color "C5DEF5" --description "Test coverage expansion" --force || true
gh label create "type:docs" --repo "$REPO" --color "5319E7" --description "Documentation and guides" --force || true
gh label create "type:refactor" --repo "$REPO" --color "F9D0C4" --description "Code refactoring and optimization" --force || true
gh label create "type:ci" --repo "$REPO" --color "BFD4F2" --description "CI/CD and automation" --force || true

echo "Creating planned issues on $REPO..."

# Issue 1
gh issue create --repo "$REPO" \
  --title "feat(frontend): integrate Stellar Wallets Kit to support xBull, Lobstr, and Albedo alongside Freighter" \
  --label "complexity:high,type:feat" \
  --body "### Summary
Upgrade the wallet connection architecture using \`@creit.tech/stellar-wallets-kit\` to allow payers to connect and sign transactions using multiple non-custodial Stellar wallets including xBull, Lobstr, Albedo, and WalletConnect, rather than solely Freighter.

### Acceptance Criteria
- [ ] Install and configure Stellar Wallets Kit.
- [ ] Provide multi-wallet selection modal during payment initiation on \`/pay/:token\`.
- [ ] Support SEP-10 authentication across all supported kit wallet adapters.
- [ ] Ensure graceful fallback if a user has no extension installed (offer Albedo web signer).

### Tech Stack
- Next.js 15, TypeScript, @creit.tech/stellar-wallets-kit"

# Issue 2
gh issue create --repo "$REPO" \
  --title "feat(frontend): implement QR code scanner and camera payment reader on public pay portal" \
  --label "complexity:medium,type:feat" \
  --body "### Summary
Add a dynamic QR code display and camera scanner on the public capability portal (\`/pay/:token\`) enabling mobile wallet users (Lobstr, Vibrant) to scan the SEP-0007 / Stellar pay URI directly from a desktop monitor.

### Acceptance Criteria
- [ ] Generate SEP-0007 compliant payment URI with destination, asset, amount, and memo.
- [ ] Render scalable QR code with copy-to-clipboard button.
- [ ] Include 1-click 'Open in Mobile Wallet' deep link.
- [ ] Add unit test verifying correct SEP-0007 URI encoding.

### Tech Stack
- React, qrcode.react, Tailwind CSS"

# Issue 3
gh issue create --repo "$REPO" \
  --title "feat(frontend): add dark mode and high-contrast accessibility theme toggle" \
  --label "complexity:low,type:feat" \
  --body "### Summary
Implement a system-aware dark mode toggle stored in \`localStorage\` using Tailwind CSS dark classes with custom high-contrast tokens for commercial dashboard legibility.

### Acceptance Criteria
- [ ] Add theme context provider with 'light', 'dark', and 'system' options.
- [ ] Add theme toggle icon button in dashboard top navigation.
- [ ] Ensure table headers, badges, and modals have high-contrast borders and text in dark mode.
- [ ] Verify print stylesheets force pure white background regardless of theme.

### Tech Stack
- Next.js 15, Tailwind CSS"

# Issue 4
gh issue create --repo "$REPO" \
  --title "test(frontend): add React Testing Library component tests for Create Invoice dynamic line item calculations" \
  --label "complexity:medium,type:test" \
  --body "### Summary
Expand frontend test coverage by writing comprehensive integration tests for the Create Invoice form (\`/invoices/new\`), verifying that adding, removing, and modifying line items dynamically recalculates subtotal, tax basis points, and grand total without floating point inaccuracies.

### Acceptance Criteria
- [ ] Test adding 5 line items with varying tax rates and quantities.
- [ ] Assert that totals match exact integer minor unit calculations.
- [ ] Test form validation errors when quantity or price is non-positive.
- [ ] Assert that client selector properly binds recipient metadata.

### Tech Stack
- Vitest, @testing-library/react"

# Issue 5
gh issue create --repo "$REPO" \
  --title "feat(frontend): add merchant invoice duplicate action on invoice detail page" \
  --label "complexity:low,type:feat" \
  --body "### Summary
Add a 'Duplicate Invoice' button on \`/invoices/:id\` allowing merchants to clone an existing invoice (line items, terms, client) into a new \`DRAFT\` with a fresh invoice number.

### Acceptance Criteria
- [ ] Add 'Duplicate' action button in invoice detail header dropdown.
- [ ] Pre-populate \`/invoices/new\` form state with duplicated items.
- [ ] Reset status, dates, and clear on-chain hash.
- [ ] Add unit test verifying clone behavior.

### Tech Stack
- React, Next.js App Router"

# Issue 6
gh issue create --repo "$REPO" \
  --title "refactor(frontend): implement SWR / TanStack Query client caching for invoice list pagination" \
  --label "complexity:medium,type:refactor" \
  --body "### Summary
Refactor data fetching on the merchant dashboard and invoices list to use SWR or TanStack Query with optimistic updates, background polling, and cache invalidation on invoice status mutations.

### Acceptance Criteria
- [ ] Configure SWR/TanStack Query client with stale-while-revalidate policy.
- [ ] Ensure changing page or status filter updates URL searchParams and fetches smoothly.
- [ ] Implement auto-revalidation when issuing or cancelling an invoice.

### Tech Stack
- Next.js 15, SWR / TanStack Query"

# Issue 7
gh issue create --repo "$REPO" \
  --title "feat(frontend): add interactive on-chain transaction explorer modal linking directly to Stellar Expert" \
  --label "complexity:low,type:feat" \
  --body "### Summary
When an invoice is paid or on-chain commitment registered, render a verification drawer displaying the 32-byte transaction hash, ledger sequence, and direct outbound links to Stellar Expert and Horizon.

### Acceptance Criteria
- [ ] Add 'View On-Chain Verification' modal component.
- [ ] Display transaction hash, ledger timestamp, and commitment SHA-256 digest.
- [ ] Add copyable hash buttons and deep link to \`https://stellar.expert/explorer/testnet/tx/:hash\`.

### Tech Stack
- React, Lucide Icons, Tailwind CSS"

# Issue 8
gh issue create --repo "$REPO" \
  --title "docs(frontend): add Storybook component playground for design system components" \
  --label "complexity:medium,type:docs" \
  --body "### Summary
Configure Storybook for the StellarBills frontend to document and test reusable fintech UI components (buttons, badges, inputs, line-item tables, and status pills) in isolation.

### Acceptance Criteria
- [ ] Install and configure Storybook with Tailwind CSS integration.
- [ ] Add stories for \`Button\`, \`Badge\`, \`Modal\`, \`InvoiceStatusPill\`, and \`MetricCard\`.
- [ ] Ensure accessibility (a11y) addon runs in Storybook.

### Tech Stack
- Storybook, React 19, Tailwind CSS"

echo "All planned issues successfully created for $REPO!"
