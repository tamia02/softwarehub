# Software Hub Pool

Next.js 15 (App Router) + TypeScript + Tailwind v4 + Framer Motion.

## Run

```bash
cp .env.example .env.local   # set CODE_HASH_SALT
npm install
npm run dev                  # http://localhost:3000
```

Demo gate codes (replace before launch): `CUST-DEMO-2026` (customer), `RSL-DEMO-2026` (reseller).

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Brand strings, runtime settings (USD/INR rate, fee %, pool expiry), cookie names |
| `src/data/tiers.ts`, `tools.ts`, `faq.ts` | Catalog content (prices in paise, values in USD) |
| `src/lib/pricing.ts` | All money math (integers, paise); retail/savings computed from settings |
| `src/lib/codes.ts` / `codes.server.ts` | Code format, mask, check-char, CSPRNG generation, salted SHA-256 hashing, rate limit |
| `src/middleware.ts` | Role gate for `/`, `/reseller/*`, `/admin/*`, `/account/*` |
| `src/app/page.tsx` | Gate (customer / reseller tiles → code form) |
| `src/app/(site)/home` | Marketing page (hero, marquee, catalog, savings, pricing, pools, FAQ, CTA) |
| `src/app/globals.css` | Brand tokens — change `--brand-primary` / `--brand-accent` / fonts here |

## Build phases (see the development guide)

- **Phase 0–1 (done):** tokens, shell, gate, full marketing page with animations, mobile QA.
- **Phase 2:** Auth.js OTP, Prisma + Postgres, Razorpay direct checkout, bundle code redemption, My Pass.
- **Phase 3:** Pools (escrow, expiry cron, refunds, fulfilment).
- **Phase 4:** Reseller dashboard + revenue split engine.
- **Phase 5:** Admin, invoices, email/SMS, analytics, SEO.
