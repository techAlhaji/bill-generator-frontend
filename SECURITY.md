# Security Policy

## 1. Supported Versions

Security updates are actively maintained for the following frontend releases:

| Version | Status |
| :--- | :--- |
| `1.0.x` | Supported (Active Production & Testnet) |
| `< 1.0.0` | Unsupported |

---

## 2. Wallet & Private Key Security Disclaimer

> [!IMPORTANT]
> **Non-Custodial Architecture:** The StellarBills frontend application is strictly non-custodial. It **never** requests, reads, transmits, or stores user secret keys (`S...`) or recovery seed phrases. All transaction signing occurs exclusively inside the user's non-custodial browser wallet extension (such as Freighter). 
> 
> Never enter your private key into any web form or input field.

---

## 3. Reporting a Vulnerability

If you identify a security issue relating to XSS, CSRF, capability URL token leakage, wallet interaction spoofing, or authentication session hijacking:

### Reporting Procedure
- **Email:** [`ademolabuild@gmail.com`](mailto:ademolabuild@gmail.com)
- **Subject:** `[SECURITY] StellarBills Frontend Vulnerability Report`
- **Information to Include:**
  - Component or page URL affected.
  - Step-by-step reproduction instructions.
  - Potential security impact or proof-of-concept.

### Response Timeline
- **Acknowledgement:** Within 48 hours.
- **Triage & Fix Delivery:** Within 3 business days.

Please do **not** disclose vulnerabilities via public GitHub issues.
