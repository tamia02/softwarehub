# Software Hub Pool

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Framer Motion · Drizzle ORM (Postgres) · Razorpay · Resend + MSG91 · PostHog.

## Run locally (zero setup)

```bash
npm install
cp .env.example .env.local        # dev secrets are fine locally; see the file
npm run dev                       # http://localhost:3000
```

With no `DATABASE_URL` the app boots an embedded Postgres (PGlite) at `.data/pglite`, applies migrations and seeds demo data. Demo sign-ins, gate codes and bundle codes are written to `.data/demo-codes.txt`. Without email/SMS keys the OTP is shown in the sign-in form; without Razorpay keys checkout shows a **Simulate payment** button that runs the real capture path.

| Role | Sign in with | Lands on |
|---|---|---|
| Customer | `customer@softwarehubpool.example` (or any new email/phone) | `/account` — My Pass |
| Reseller | `reseller@softwarehubpool.example` | `/reseller` dashboard |
| Admin | `admin@softwarehubpool.example` | `/admin` panel |

Gate codes: `CUST-DEMO-2026` / `RSL-DEMO-2026` (replace before launch).

## Scripts

| Command | What |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Vitest — unit (split engine, codes, pricing) + integration (orders, pools, expiry) on in-memory Postgres |
| `bash scripts/uat.sh <url>` | 39-step end-to-end UAT over HTTP (needs `ALLOW_MOCK_GATEWAY=true ALLOW_DEV_OTP=true CRON_SECRET=x` on the server) |
| `npm run loadtest -- <url> [seconds] [connections]` | autocannon against `/home` and hot APIs |
| `npm run db:generate` | regenerate SQL migration from `src/db/schema.ts` |
| `npm run db:migrate` / `db:seed` / `db:reset` | apply migrations / seed empty DB / wipe + reseed |

## Where things live

| Path | What |
|---|---|
| `src/config/site.ts` | Brand strings, default settings, cookie names |
| `src/app/globals.css` | Design tokens — change `--brand-primary` / `--brand-accent` here |
| `src/db/schema.ts` | All tables (§7). Money in paise, enums as validated text |
| `src/db/seed.ts` | Demo data (tiers, 35 tools, vendors, users, pools, code inventory) |
| `src/lib/codes*.ts` | Code formats, check digit, CSPRNG generation, salted hashing, allocation |
| `src/lib/auth.server.ts` | OTP + JWT sessions, reseller gate-code binding, attribution |
| `src/lib/payments.server.ts` | Razorpay / mock gateway, signatures, refunds |
| `src/lib/orders.server.ts` | Order → capture → invoice → fulfilment state machine (idempotent) |
| `src/lib/pools.server.ts` | Pool lifecycle: create, join, fill, fulfil, expire + refund |
| `src/lib/split.ts` | Pure revenue-split engine (§6.2) |
| `src/lib/passes.server.ts` | Redemption, tool claims, guarantee issues, expiry reminders |
| `src/lib/reseller.server.ts`, `admin.server.ts` | Dashboard queries and mutations |
| `src/app/api/**` | The §11 API surface |
| `src/app/(site)/**` | Marketing, checkout, pool pages, My Pass, legal |
| `src/app/(dashboard)/reseller/**`, `admin/**` | Dashboards (sidebar shell, server actions) |
| `docs/` | Security review, launch checklist |

## Deploy

Vercel + Neon/Supabase. Set the variables from `.env.example`, run `npm run db:migrate` in the build step (or leave `DB_AUTO_MIGRATE` on for the first deploy), subscribe the Razorpay webhook, and enable the crons in `vercel.json`. Full list: `docs/LAUNCH-CHECKLIST.md`.

## Deliberate deviations from the build guide

- **Drizzle instead of Prisma** — same Postgres schema, but Drizzle runs on embedded PGlite for local dev and tests without installing Postgres.
- **Custom OTP auth instead of Auth.js** — Auth.js has no phone-OTP flow; the custom implementation is ~150 lines (`auth.server.ts` + `session-edge.ts`) and gives full control over rate limits and the reseller-binding step.
- **Undelivered bundle codes are held encrypted (AES-GCM), not hash-only** — the guide asks for hash-only storage, but customers must receive the plaintext after purchase. The ciphertext is wiped on first reveal; the hash remains the only long-term copy.
