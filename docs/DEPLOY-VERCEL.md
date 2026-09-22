# Deploying to Vercel

Repo: https://github.com/tamia02/softwarehub (branch `main`).

## 1. Import the project
Vercel → **Add New → Project** → import `tamia02/softwarehub`. Framework is auto-detected (Next.js). Leave build settings default.

## 2. Environment variables (Project → Settings → Environment Variables)

Generate each secret with:
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

| Name | Value | Required |
|---|---|---|
| `CODE_HASH_SALT` | random 64-hex | yes — **never change after codes are issued** |
| `CODE_ENCRYPTION_KEY` | random 64-hex (exactly 64 chars) | yes |
| `AUTH_SECRET` | random 64-hex | yes |
| `CRON_SECRET` | random 64-hex | yes (Vercel Cron sends it automatically) |
| `DATABASE_URL` | Neon / Supabase Postgres URL with `?sslmode=require` | **for real data**. Without it the app runs an in-memory demo database that resets on every cold start |
| `ALLOW_MOCK_GATEWAY` | `true` | demo only — enables the "Simulate payment" button when Razorpay keys are absent |
| `ALLOW_DEV_OTP` | `true` | demo only — shows the OTP on the sign-in screen when no email/SMS provider is set |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET` | from Razorpay dashboard | when going live |
| `RESEND_API_KEY`, `EMAIL_FROM` | from Resend | when going live |
| `MSG91_AUTH_KEY`, `MSG91_SENDER`, `MSG91_TEMPLATE_OTP` | from MSG91 | when going live |
| `NEXT_PUBLIC_POSTHOG_KEY` | from PostHog | optional |

For a first demo deploy, set the four secrets plus `ALLOW_MOCK_GATEWAY=true` and `ALLOW_DEV_OTP=true`.

## 3. Deploy
Click **Deploy**. First build takes ~2–3 minutes. The site is at `https://<project>.vercel.app`.

Demo sign-ins on the demo database: `admin@softwarehubpool.example`, `reseller@softwarehubpool.example`, `customer@softwarehubpool.example`. Gate codes `CUST-DEMO-2026` / `RSL-DEMO-2026`.

## 4. Going real
1. Create a Postgres on Neon or Supabase, set `DATABASE_URL`, redeploy. Migrations apply automatically on first request (`DB_AUTO_MIGRATE` defaults to on); the demo seed only runs on an empty database.
2. Remove `ALLOW_MOCK_GATEWAY` and `ALLOW_DEV_OTP`.
3. Add Razorpay keys and point the webhook at `https://<domain>/api/webhooks/razorpay` (events: `payment.captured`, `refund.processed`).
4. Add Resend + MSG91 keys.
5. Set `site.url` in `src/config/site.ts` to your domain and redeploy.
6. Crons in `vercel.json` are picked up automatically (pool expiry every 15 min, pass reminders daily).

Full pre-launch list: `docs/LAUNCH-CHECKLIST.md`.
