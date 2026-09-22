# Deploying to a Hostinger VPS with your own domain

What you end up with: the app running under PM2 on Ubuntu, a local PostgreSQL
database, Nginx in front on ports 80/443 with a free Let's Encrypt certificate,
and the two cron jobs (pool expiry, pass reminders) installed. Everything in
this guide is scripted in `deploy/`; you mostly copy-paste four commands.

Plan needed: **KVM 1** (1 vCPU / 4 GB) is enough. Pick **Ubuntu 24.04** as the
OS when creating the VPS (plain OS, not a one-click template).

---

## 1. Point the domain at the VPS (Hostinger hPanel)

1. hPanel → **VPS** → your server → copy the **IPv4 address**.
2. hPanel → **Domains** → your domain → **DNS / Nameservers** → **DNS records**.
   Delete any existing `A` records for `@` and `www`, then add:

   | Type | Name | Points to | TTL |
   |---|---|---|---|
   | A | `@` | `<VPS IPv4>` | 300 |
   | A | `www` | `<VPS IPv4>` | 300 |

   If the domain was bought elsewhere, add the same two records at that registrar
   (or change its nameservers to Hostinger's and then do the above).
3. Wait until `nslookup yourdomain.in` (from your laptop) returns the VPS IP —
   usually 5–30 minutes. The SSL step below fails until this is true.

## 2. SSH into the VPS

hPanel → VPS → **SSH access** shows the root password (set one if you haven't).

```bash
ssh root@<VPS IPv4>
```

Windows: use the terminal / PowerShell, or hPanel's **Browser terminal**.

## 3. Run the setup script

```bash
curl -fsSL https://raw.githubusercontent.com/tamia02/softwarehub/main/deploy/setup-vps.sh -o setup-vps.sh
DOMAIN=yourdomain.in EMAIL=you@example.com bash setup-vps.sh
```

Takes ~5 minutes. It installs Node 22, PostgreSQL, Nginx, Certbot and PM2,
clones the repo to `/var/www/shp`, creates the `shp` database, writes
`/var/www/shp/.env.production` with **freshly generated secrets**, builds the
app, starts it under PM2 (auto-restarts on reboot), installs the cron jobs, and
issues the HTTPS certificate.

Open `https://yourdomain.in` — the site is live with the demo switches on
(`ALLOW_MOCK_GATEWAY`, `ALLOW_DEV_OTP`), so you can walk the whole flow:
gate codes `CUST-DEMO-2026` / `RESL-DEMO-2026`, sign-ins
`admin@softwarehubpool.example`, `reseller@…`, `customer@…` (OTP is shown on
screen), "Simulate payment" at checkout.

If the script printed `certbot failed`, DNS hadn't propagated yet — re-run the
one-line `certbot …` command it printed once `nslookup` shows the VPS IP.

## 4. Go live (real payments, email, SMS)

Edit the env file and fill in the keys, then restart:

```bash
nano /var/www/shp/.env.production
sudo -u shp pm2 restart shp --update-env
```

- **Remove** `ALLOW_MOCK_GATEWAY` and `ALLOW_DEV_OTP`.
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — from the
  Razorpay dashboard. Add a webhook there pointing at
  `https://yourdomain.in/api/webhooks/razorpay` with events
  `payment.captured` and `refund.processed`.
- `RESEND_API_KEY` + `EMAIL_FROM` (verify the domain in Resend; add the DNS
  records it gives you in hPanel the same way as step 1).
- `MSG91_AUTH_KEY`, `MSG91_SENDER`, `MSG91_TEMPLATE_OTP` for SMS OTPs.
- `NEXT_PUBLIC_POSTHOG_KEY` (optional analytics).

`NEXT_PUBLIC_*` values are baked in at build time, so after changing any of
those run `bash /var/www/shp/deploy/deploy.sh` instead of just restarting.

Full pre-launch list: `docs/LAUNCH-CHECKLIST.md`.

## 5. Updating the site later

Every time new code is pushed to `main` on GitHub:

```bash
ssh root@<VPS IPv4>
bash /var/www/shp/deploy/deploy.sh
```

Pulls, installs, builds and reloads PM2 (a few seconds of build, no downtime
for the reload). Database migrations in `drizzle/` apply automatically on the
first request after a deploy.

## Day-to-day commands

| Task | Command |
|---|---|
| App logs | `sudo -u shp pm2 logs shp` |
| App status / restart | `sudo -u shp pm2 status` · `sudo -u shp pm2 restart shp` |
| Nginx logs | `tail -f /var/log/nginx/error.log` |
| Database shell | `sudo -u postgres psql shp` |
| Backup database | `sudo -u postgres pg_dump shp \| gzip > /root/shp-$(date +%F).sql.gz` |
| Restore database | `gunzip -c file.sql.gz \| sudo -u postgres psql shp` |
| Renew SSL manually | `certbot renew` (auto-renews via `certbot.timer`) |
| Cron jobs | `cat /etc/cron.d/shp` |

Nightly backups: hPanel → VPS → **Backups** (snapshot of the whole server), or
add the `pg_dump` line above to root's crontab (`crontab -e`) with
`0 3 * * *` and copy the files off-server.

## Troubleshooting

- **502 Bad Gateway** — app not running: `sudo -u shp pm2 logs shp --lines 100`.
  Usually a missing env var; fix `.env.production`, `pm2 restart shp --update-env`.
- **Site loads over http only** — certificate not issued; run the `certbot`
  command from step 3.
- **`CODE_HASH_SALT must be set`** — the env file wasn't read; make sure it is at
  `/var/www/shp/.env.production` and owned by `shp`.
- **Out of memory during `npm run build`** on KVM 1 — add swap once:
  `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab`.
