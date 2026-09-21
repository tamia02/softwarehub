# Launch checklist

Work top to bottom. Items marked **BLOCKER** stop the launch.

## 0. Business prerequisites (§0 of the guide)

- [ ] **BLOCKER** Written partner/reseller/affiliate agreement with every vendor that is ticked *active* in `/admin/tools`. Untick the rest — they disappear from the catalog and from new passes automatically.
- [ ] **BLOCKER** Refund/replacement policy signed off by counsel and pasted into `/refund-policy` (current text is a draft).
- [ ] Terms and privacy reviewed for DPDP Act 2023.
- [ ] Razorpay (or Cashfree) business verification complete; pool-style "many small payments into one order" explained to the gateway's risk team.
- [ ] GST registration; seller GSTIN, state code, legal name and address entered in `/admin/settings`.

## 1. Brand

- [ ] Replace `--brand-primary`, `--brand-accent` and fonts in `src/app/globals.css` / `src/app/layout.tsx`.
- [ ] Replace `Logo` / `Wordmark` SVGs in `src/components/brand/Logo.tsx`; add `public/favicon.ico`.
- [ ] Upload real vendor wordmarks (only for vendors with agreements) and swap `VendorMark` to use them.
- [ ] Replace hero illustration layers in `HeroIllustration.tsx`.
- [ ] Set `site.url`, `site.supportEmail` in `src/config/site.ts`.

## 2. Environment (production)

- [ ] `DATABASE_URL` → Neon/Supabase Postgres; run `npm run db:migrate` in CI; set `DB_AUTO_MIGRATE=false`.
- [ ] `CODE_HASH_SALT`, `CODE_ENCRYPTION_KEY`, `AUTH_SECRET`, `CRON_SECRET` — 32-byte random each. **Never rotate `CODE_HASH_SALT` after codes are issued** (existing codes would stop verifying).
- [ ] `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`; webhook URL `https://<domain>/api/webhooks/razorpay` subscribed to `payment.captured` and `refund.processed`.
- [ ] `RESEND_API_KEY` + verified sending domain; `MSG91_AUTH_KEY` + DLT-approved OTP template id.
- [ ] `NEXT_PUBLIC_POSTHOG_KEY`.
- [ ] Confirm `ALLOW_MOCK_GATEWAY` and `ALLOW_DEV_OTP` are **unset**.

## 3. Data

- [ ] Void the demo gate codes in `/admin/codes`; generate real customer/reseller gate codes.
- [ ] Generate bundle code inventory per vendor allocation (`/admin/codes` → batch ref = allocation id). Paid orders with no stock park as *awaiting inventory* and auto-fulfil when stock arrives.
- [ ] Set reseller prices and platform fee in `/admin/settings` (defaults ₹20,000 / ₹38,000 / 2 %).
- [ ] Set the USD→INR rate (drives every "retail value" on the site).
- [ ] Delete seeded demo users/pools (`npm run db:reset` on an empty prod DB, or never run the seed there — it only runs on an empty PGlite).

## 4. Verification

- [ ] `npm test` green.
- [ ] `npm run build` green with production env.
- [ ] Staging UAT: `CRON_SECRET=x bash scripts/uat.sh https://staging.<domain>` with `ALLOW_MOCK_GATEWAY=true ALLOW_DEV_OTP=true` on staging only → 39/39.
- [ ] One real ₹1 Razorpay test-mode purchase → code delivered by email + SMS → redeemed → tool claimed → GST invoice printable.
- [ ] One real pool of 5 in test mode → auto-fulfil → member passes → statement CSV → payout request → admin marks paid.
- [ ] Force one pool expiry (edit `expires_at` in DB) → cron refunds every seat → members receive the expiry email.
- [ ] Lighthouse mobile ≥ 90 on `/home` (marketing page is ISR-cached; see `scripts/loadtest.mjs` for throughput).
- [ ] Security review findings 1–5 in `docs/SECURITY-REVIEW.md` triaged.

## 5. Go-live

- [ ] Vercel cron enabled (`vercel.json`): pool expiry every 15 min, pass reminders daily 09:00.
- [ ] Custom domain + HTTPS; HSTS preload after 1 week of clean traffic.
- [ ] Uptime monitor on `/api/pricing` and `/api/cron/pools-expire` (expect 401 without the secret — proves the route is alive).
- [ ] Alerts: Resend/MSG91 failures, `awaiting_inventory` orders (admin email is sent automatically), webhook 4xx.
- [ ] Backup policy on the Postgres provider (PITR ≥ 7 days).

## Open decisions still with the client (§13)

| Decision | Current default | Where to change |
|---|---|---|
| Pool payment model | Escrow for everyone; single-payer available to resellers | `createPool` / create-pool form |
| Pool expiry | 7 days, auto-refund | `/admin/settings` |
| Reseller code prices | ₹20,000 Starter / ₹38,000 Pro | `/admin/settings` |
| Platform fee | 2 % | `/admin/settings` |
| Distribution | Shared bundle by default; per-pool "assigned" matrix | pool creation / reseller pool detail |
| Brand | placeholders | see §1 |
| Catalog | all 35 seeded active | `/admin/tools` |
