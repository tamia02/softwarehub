# Security review — Software Hub Pool (pre-launch)

Scope: the checklist from §11 of the development guide plus the OWASP items that apply to a payments + code-distribution app. Status as of the Phase 6 review.

| # | Control | Status | Where |
|---|---------|--------|-------|
| 1 | All money math in paise (integers) on the server | ✅ | `src/lib/pricing.ts`, `orders.server.ts`, `split.ts` — no floats reach the DB; INR formatting happens at the edge only |
| 2 | Razorpay checkout signature verified (HMAC order\|payment) | ✅ | `payments.server.ts:verifyCheckoutSignature`, used by `/api/payments/verify` |
| 3 | Webhook signature verified over the raw body | ✅ | `/api/webhooks/razorpay` — unsigned requests → 401 (UAT §8) |
| 4 | Amount from the gateway must equal the order amount | ✅ | `onPaymentCaptured` throws on mismatch (test: "rejects an amount mismatch") |
| 5 | Idempotency keys on order creation | ✅ | `orders.idempotency_key` unique index; `createOrder` returns the existing gateway order (UAT §3) |
| 6 | Payment capture idempotent (webhook + checkout handler may both fire) | ✅ | unique `payments.gateway_payment_id`; status transition guarded with `WHERE status='created'` |
| 7 | RBAC on `/reseller/*`, `/admin/*`, `/account/*` | ✅ | `middleware.ts` (JWT verify at the edge) **and** `requireUser/requireApiUser` inside every page/route — defence in depth |
| 8 | Object-level authorisation (IDOR) | ✅ | pool fulfil/statement check `resellerId === user.id`; invoices/claims/success page check `userId`; admin bypass explicit |
| 9 | CSRF | ✅ | Session cookie is `SameSite=Lax` + `HttpOnly`; mutating APIs require a JSON body (cross-site form posts cannot set `Content-Type: application/json` without CORS preflight); Server Actions are origin-checked by Next.js |
| 10 | Codes never stored or logged in plaintext | ✅ | only salted SHA-256 (`crypto.server.ts`). Undelivered bundle codes are held AES-256-GCM encrypted and the ciphertext is wiped on first reveal. Audit rows never include the code. Console fallback for email/SMS is disabled in production |
| 11 | Check digit + rate limit + lockout on code verification | ✅ | mod-36 check char (`codes.ts`), 5 attempts / 10 min / IP, gate code locks after 10 failures (`recordGateFailure`) |
| 12 | OTP hardening | ✅ | 6 digits, 10 min TTL, hashed at rest, 5 wrong attempts per code, 5 requests / 10 min / IP+identifier, single-use |
| 13 | Session tokens | ✅ | HS256 JWT signed with `AUTH_SECRET`, 30-day expiry, role re-read from DB on every server request so demotions take effect immediately |
| 14 | Secrets required in production | ✅ | `CODE_HASH_SALT`, `CODE_ENCRYPTION_KEY`, `AUTH_SECRET` throw at first use if unset; mock gateway and dev-OTP are hard-disabled unless `ALLOW_*` staging flags are set |
| 15 | Input validation | ✅ | every JSON route parses with zod (`lib/api.ts`); GSTIN regex client + upper-cased server; identifiers normalised |
| 16 | Security headers | ✅ | CSP (Razorpay + PostHog allow-listed), HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy (`next.config.ts`, `middleware.ts`) |
| 17 | Audit trail for every state change | ✅ | `audit_log` (who, entity, from → to, meta) — orders, payments, codes, pools, payouts, KYC, settings |
| 18 | Cron endpoints authenticated | ✅ | `Authorization: Bearer $CRON_SECRET`; refuses in production when the secret is unset |
| 19 | PII minimisation | ✅ | public `/api/pools/:id` returns no member data; reseller sees only members of their own pools; bank account shown masked in admin |
| 20 | Dependency audit | ⚠️ | `npm audit` reports 2 advisories in transitive dev tooling (not shipped to the browser). Re-run before launch |

## Findings to close before launch

1. **CSP uses `'unsafe-inline'` for scripts.** Next.js inline bootstrap scripts need it unless nonces are wired through `middleware.ts`. Low risk today (no user-generated HTML is rendered), but move to nonce-based CSP in the hardening sprint.
2. **In-memory rate limiter.** Fine on one instance; on multiple Vercel regions/instances back it with Upstash Redis or a Postgres table (`lib/rate-limit.server.ts` is the single swap point).
3. **Bank details at rest.** `resellers.bank_json` relies on the database provider's encryption at rest. If the compliance team requires application-level encryption, reuse `encrypt()/decrypt()` from `crypto.server.ts`.
4. **Vendor claim references.** `claimTool` issues a deterministic reference until vendor allocation APIs are integrated; make sure real per-seat coupons replace it so a reference cannot be guessed.
5. **Refund reconciliation.** Refunds are recorded optimistically when the API call succeeds; wire the `refund.processed` webhook (already handled) to a daily reconciliation report.

## Things reviewed and considered acceptable

- Demo codes (`CUST-DEMO-2026`, `RSL-DEMO-2026`) are seeded only by `seedIfEmpty`; void them from `/admin/codes` before launch (see launch checklist).
- The one-time code reveal on `/checkout/success` is gated by session + order ownership and wipes the ciphertext; email/SMS delivery is the redundant channel.
- Reseller gate codes bind to the first account that signs in with them (`gate_codes.bound_user_id`), so a leaked code cannot be reused by a second account.
