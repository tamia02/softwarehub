# Software Hub Pool v2 — feature list

Research done on 22 Sep 2026 by walking every public page of g2g.com,
socialbazarsmm.com and madleets.me (home, catalogues, seller/reseller pages,
protection/escrow pages, API docs, terms, footers). Registration-only areas
(dashboards, checkout) are reconstructed from the public pages, help copy and
the standard patterns those products follow.

Everything below is written in our own words. No copy, layout or artwork from
the reference sites is reused.

---

## 0. Site map (what changes)

```
/                       Gate — "I'm a customer" · "I'm a reseller"  (exists)
│
├── Customer            ← Social Bazar SMM, rebuilt in our cream/outlined UI
│   ├── /home           Growth panel landing (hero, platforms, stats, how it works,
│   │                   popular services, reseller teaser, testimonials, payments, FAQ)
│   ├── /services       Full service catalogue (platform tabs, category groups, table)
│   ├── /passes         The existing Starter / Pro Pass site (moved from /home)
│   ├── /api-docs       Public API v2 docs
│   ├── /account        Wallet, add funds, new order, orders, refills, tickets, API key
│   └── /terms /privacy /refund-policy
│
└── Reseller            ← three doors after the reseller gate
    ├── /reseller/pool      Pool system  (exists — everything already built)
    ├── /reseller/market    "Community Market" — the G2G-style marketplace
    │                       (KYC → list products → escrow → 14-day hold → payout)
    └── /reseller/lab       "The Lab" — dark, terminal-style tools + playbooks
                            (the madleets look, legitimate content only)
```

Assumption: customers keep access to the Starter/Pro Pass site (it moves to
`/passes` and is linked from the customer nav) — nothing already built is thrown
away. The SMM panel becomes the customer landing page as requested.

---

## 1. Customer — Growth Panel (from socialbazarsmm.com)

### 1.1 Landing page (`/home`) — section by section
| # | Section | What it contains |
|---|---|---|
| 1 | Promo bar | Live offer / festival deal text, dismissible (exists) |
| 2 | Header | Services · Reseller Hub · API · Terms · Sign in · **Get started** |
| 3 | Hero | Headline (wholesale social growth, India-first), sub-line, "10K+ users" badge, platform buttons (Instagram, Facebook, YouTube, Pinterest, Snapchat, Reddit, +More), animated stat counters (customers, orders delivered, satisfaction %) |
| 4 | Sign-in / register cards | Side-by-side email login + register, Google sign-in, "passwordless" OTP (we already have OTP auth) |
| 5 | Why choose us | 4 tiles: quality, multiple payment methods, wholesale prices, fast delivery |
| 6 | How it works | 4 steps: Register → Add funds → Pick a service → Order & track |
| 7 | Offer carousel | 5 rotating banner cards (mega offer, festival, new services, reseller, API) — admin-editable |
| 8 | Creator section | "Turn attention into growth": instant automation, passwordless access, auto-refill, 24/7 dispatch |
| 9 | Live analytics mock | Sample campaign card (reach, followers delivered, views/min speed) — animated |
| 10 | Reseller Hub teaser | 4-step reseller flow, Bronze/Silver/Gold margins, CTA to /reseller |
| 11 | Popular services | 8 cards with rate per 1K (IG followers, IG likes, YT retention views, TG members, YT subscribers, FB likes, X followers, YT watch-time) |
| 12 | Platform stats | Total orders delivered, active users & resellers, active services, success rate — live from DB |
| 13 | Testimonials | 12 cards (agency, creator, influencer, reseller), carousel on mobile |
| 14 | Payment methods | PhonePe, Google Pay, Paytm QR, UPI, Navi, CRED, cards, crypto (logos) |
| 15 | FAQ | 7 items: safety, delivery speed, refills, API, payments, failed orders, support |
| 16 | Closing CTA | "Ready to grow?" — Create account · Explore services |
| 17 | Footer | Description, services links, company links, socials, status pill ("All systems operational"), legal |
| 18 | Floating | WhatsApp + Telegram support buttons; VIP community modal (once per session) |

### 1.2 Services catalogue (`/services`)
- Header stats: categories, services, uptime; "Watch video guide" button.
- Platform tabs: All · Instagram · YouTube · TikTok · Telegram · Facebook · Twitter/X · Spotify · Discord · OTT & Canva · AI & Tools · Web traffic.
- Category accordion (count per category), currency switch (INR / USD).
- Service table: ID · name + tags (Instant start, High quality, Refill guarantee, Non-drop, Drip-feed) · rate per 1K · min–max · avg time · Details · Order.
- Details drawer: description, start time, speed/day, refill window (e.g. R30 / R365 / lifetime), cancel allowed, quality notes, example link format.
- Search across services; "members only" rate blur for logged-out visitors.

### 1.3 Customer dashboard (`/account`)
| Page | Features |
|---|---|
| Overview | Wallet balance, spent total, orders count, active tier (Standard / Bronze / Silver / Gold), announcements |
| New order | Platform → category → service; link validation per platform; quantity with min/max and live charge; drip-feed (runs × interval); custom comments upload; mass order (one per line) |
| Orders | Table with status (Pending, In progress, Processing, Partial, Completed, Cancelled, Refunded), start count, remains, charge; filters, search, CSV export |
| Refill | Eligible orders list, one-click refill request, status |
| Add funds | UPI QR / PhonePe / GPay / Paytm via Razorpay; crypto (manual with proof); bonus % on deposit tiers; deposit history |
| Tickets | Subject (order / payment / refill / other), thread with attachments, status |
| API | Personal key (regenerate), endpoint URL, rate limit, docs link |
| Reseller Hub | Plans: Starter 7-day ₹49 · Pro 30-day ₹249 · Elite 90-day ₹499 (30–55 % off); redeem licence key `SMB-…`; custom pricing request |
| Child panels (later) | Whitelabel sub-panel request (domain, branding) |
| Settings | Name, email, phone, password/OTP, 2-step, notifications |

### 1.4 Public API v2 (`/api-docs` + `/api/v2`)
Standard SMM panel API so resellers' own panels can plug in:
- `POST key, action=services` → list (service, name, type, category, rate, min, max, refill, cancel)
- `action=add` (service, link, quantity, runs, interval, comments) → `{order}`
- `action=status` (order | orders csv) → charge, start_count, status, remains, currency
- `action=refill` (order) / `action=refill_status`
- `action=cancel` (orders)
- `action=balance`
Key shown only when signed in; per-key rate limit; request log in dashboard.

### 1.5 Admin additions
Services CRUD (platform, category, rate, min/max, avg time, tags, provider mapping, active), categories ordering, deposit approval (crypto), order state changes / partial refund, refill approval, tickets inbox, promo banners, tier pricing, licence-key generator, announcements, stats.

### 1.6 Provider fulfilment
Orders are dispatched to an upstream provider through the same API shape
(configurable provider URL + key per service), with a **mock provider** for
local/demo that advances orders over time. Real provider keys go in admin.

---

## 2. Reseller — Community Market (from g2g.com)

Name on site: **Community Market** (never "G2G").

### 2.1 Public pages
| Page | Features |
|---|---|
| Market home | Search with top searches, trust strip (Buyer protection · Instant delivery % · rating · 24/7 support), category explorer (Software & subscriptions, Activation codes, Digital products, Services & coaching, Gift cards & top-ups), trending brands grid (offers + sellers count per brand), "Sell with us" band, protection explainer, featured sellers, footer |
| Category page | Breadcrumbs, total offers / sellers, sibling categories, brand chips, filters (brand, region, delivery type, budget, online sellers), sort (recommended, price, sold, rating), result cards (title, region, sold count, offers count, "from" price INR + USD) |
| Offer page | Title, seller card (level, rating %, sold, delivery time, online status), price + quantity, min qty, stock, delivery method (instant code / manual / account handover), description, FAQ, related offers, **Buy now** / **Chat** |
| Seller profile | Level, badge (Regular / Verified / Business), 90-day positive rating, offers sold, successful deliveries %, About, member since, languages, followers, featured listings, store categories |
| Protection page | "Every trade covered": verified sellers, payment held in escrow, inspection window, buyer guarantee; 4-step flow; what is / isn't covered; how to open a claim (4 steps); trading rules (on-platform chat only, accurate order details) |
| Become a seller | Zero listing fees, commission from X %, seller tools, protection, exposure, withdrawal options; testimonials; Business account upsell; FAQ (what can I sell, fees, payouts, proof of delivery, KYC) |

### 2.2 Seller onboarding & KYC
1. Reseller account → **Apply to sell** (shop name, category, country, phone).
2. **Identity verification**: government ID (Aadhaar/PAN/passport) front + back, selfie/liveness photo, address; status Pending → Approved / Rejected with reason; re-submit.
3. Business upgrade: GSTIN, company docs, bank account in company name.
4. Payout method: UPI ID / bank account (IFSC) / PayPal — verified with a ₹1 penny-drop (mock in demo).
Selling is blocked until KYC = Approved; withdrawals blocked until payout method verified.

### 2.3 Seller Center (`/reseller/market/*`)
| Page | Features |
|---|---|
| Dashboard | Sales today/7d/30d, pending orders, funds (on-hold / available / withdrawn), rating, level progress |
| Listings | Create/edit offer: category, brand, title, description (rich text), delivery type, price, currency, stock/inventory (bulk code upload for instant delivery), min/max qty, region, delivery time, images; duplicate; pause; boost (featured slot) |
| Orders | New → Delivering → Delivered → Inspection → Completed / Disputed / Refunded; deliver via code reveal, file, or chat; **proof of delivery upload required** (screenshot/video) |
| Chat | Order-bound chat with buyer, attachments, canned replies, on-platform only (evidence for disputes) |
| Finance | Ledger of every order: gross, commission, net; hold release date; withdrawals (min amount, fee), payout history, invoices |
| Reviews | Buyer ratings, reply |
| Level & badges | Level from completed orders + rating; Verified badge after KYC; Business badge |
| Shop settings | Store name, banner, About, languages, vacation mode |

### 2.4 Escrow, inspection window and the 14-day hold (as requested)
1. Buyer pays (Razorpay) → funds held by platform.
2. Seller delivers → order enters **inspection**: 72 h for instant/digital goods, **14 days for account / device-installed products**.
3. Buyer confirms, or the window passes with no claim → order completes.
4. Seller balance credited to **on-hold**; released to **available** 14 days after completion when no dispute is open.
5. Withdrawal from available balance (fee per method).
Disputes: buyer → "Reopen" & chat → escalate → evidence → admin review → refund (full/partial) or release. Off-platform trading, buyer's remorse, wrong details, chargebacks = not covered (shown on the protection page).

### 2.5 Buyer side (any signed-in user, customer or reseller)
Cart/checkout per offer, order page with delivery + inspection countdown, confirm receipt, reopen/claim, reviews, chat, purchase history, wishlist/follow seller.

### 2.6 Admin additions
KYC queue with document viewer & decision, listings moderation (prohibited-item rules), disputes desk, commission table by category, hold/inspection durations, withdrawals approval, seller levels config, fraud flags (velocity, chargebacks), category & brand management.

### 2.7 Deliberately excluded from Community Market
- Bulk **third-party account** sales (e.g. "phone-verified Gmail", "smurf accounts"). These are TOS violations on the platforms concerned and a chargeback/fraud magnet; listings policy will prohibit them. Everything else G2G lists (subscriptions, keys, gift cards, top-ups, digital goods, coaching/services) is in scope.

---

## 3. Reseller — The Lab (from madleets.me, dark theme)

Look: full dark theme, terminal/monospace accents, scan-line & grid backgrounds,
typed-text hero, live "activity" ticker, glitch 404 page, command palette (⌘K) —
built to a much higher finish than the reference. Own colour system (deep
graphite + acid green + amber), separate from the cream site, switchable by route.

### 3.1 Pages
| Page | Features |
|---|---|
| Lab home | Typed hero ("81 tools, 3 tiers"), platform stats (tools, runs today, members, playbooks), What's new, streak & top contributors, latest playbooks, Browse all tools, Redeem code |
| All tools | Tier tabs Free / Pro / VIP with counts; category groups (Decode & convert, Domain & network, Security checks, Files & generators, Text & data, Recon); search; "runs in your browser" badge |
| Tool page | Tool UI, description, examples, keyboard shortcuts, share link, "add to favourites" |
| Playbooks ("Methods", legitimate) | Tier-gated long-form guides written by admins/resellers: growth playbooks, security hardening, automation recipes, reseller selling guides; markdown with code blocks, reading time, votes, comments |
| Forum / Public threads | Threads with tags, public share links, reputation, streaks, top contributors |
| Upgrade | Pro / VIP plans (monthly, 3-month), feature matrix, redeem licence code |
| Contact · Donate · Advertise | Simple forms |
| 404 | Terminal-style "target not found" page |

### 3.2 Tools to build (all run client-side or against public APIs; no accounts, no credentials)
**Decode & convert:** JWT reader · Base64 · Hex ⇄ text · URL encode/decode/parse · JSON formatter/validator · CSV ⇄ JSON · Unix timestamp · Cron reader · Colour converter + contrast · Regex tester · Text diff · User-agent parser · UUID/token generator · Markdown preview · Case/slug converter · Number base converter
**Domain & network:** DNS lookup (DoH) · WHOIS · HTTP security headers grader · My IP & network · SSL certificate viewer · Subdomain finder (crt.sh) · IP geolocation · Ping/latency (browser) · robots.txt / sitemap viewer · Tech stack detector
**Security checks:** Breach checker (k-anonymity) · Password strength (entropy, crack time) · Password/passphrase generator · Email validator (MX + disposable) · Email header analyser (SPF/DKIM/DMARC) · URL safety (Google Safe Browsing / PhishTank) · Hash calculator (SHA-1/256/384/512, MD5) · Hash identifier · HMAC generator · CORS tester · CSP evaluator · Open-redirect tester (own domains)
**Files & generators:** EXIF reader & stripper · QR generate/read · Image → Base64 · Favicon generator · Fake **test** persona (clearly synthetic test data for QA forms) · Lorem ipsum · Placeholder image · PDF metadata reader · File type identifier (magic bytes)
**Recon (public data only):** Username availability across platforms · Reverse IP · DNS dumpster-style map · Wayback snapshots · Google dork builder (for authorised research)
**Utilities:** CopyPaste (device-to-device clipboard via short code) · Temp email (own domain catch-all inbox) · Countdown / timer · Text emoji art

### 3.3 Not being built (from the reference)
CC generator / live CC checker · BIN "intel" for card testing · "leaks" · fraud "methods" · Netflix/streaming cookie & session sharing · shared VPN credentials · documents generator (fake invoices, bank statements, pay stubs, marksheets). These are fraud or forgery tools. The section keeps the same structure with legitimate content.

### 3.4 Admin additions
Tools registry (tier, category, active), playbooks editor with tier gating, forum moderation, Pro/VIP plan pricing, licence code generator, contributors/reputation settings.

---

## 4. Pool system (exists) — small additions
- Reseller door 1 of 3; landing card explains it next to Market and Lab.
- Pool page shows both INR and USD (done), reseller split (done).
- Anything else found missing while wiring the new gate: fix as found.

---

## 5. Cross-cutting
- **Gate**: customer → Growth Panel; reseller → chooser with three doors (Pool · Market · Lab), remembered in the role cookie; switch anytime from the header.
- **Auth**: one account works everywhere; roles: customer, reseller, seller (KYC-approved reseller), admin.
- **Wallet**: single INR wallet per user used by SMM orders and Market purchases; Razorpay for deposits; ledger table for every movement (deposit, order, refund, hold, release, withdrawal, commission).
- **Notifications**: email/SMS/in-app for order status, KYC decision, hold release, dispute updates, refill done.
- **Themes**: cream (customer, market, pool) and dark Lab theme, both from tokens; consistent type scale and outlined-pill components.
- **Currency**: INR primary, USD shown alongside everywhere (done for passes; extend).
- **Legal pages**: terms, refund policy, privacy, prohibited items, seller agreement, DPDP notice.
- **Analytics**: PostHog events for funnel steps in all three modules.
- **Tests**: unit tests for wallet ledger, escrow state machine, hold release, KYC state machine, SMM order state machine, API v2; HTTP UAT extended for all three flows.

---

## 6. Build order

| Phase | Deliverable |
|---|---|
| A | Gate + role chooser, nav restructure, `/passes` move, wallet + ledger core |
| B | Growth Panel: landing, services catalogue, dashboard (order, orders, funds, refills, tickets), API v2, admin services, mock provider |
| C | Community Market: categories/brands, listings, offer page, seller onboarding + KYC, checkout → escrow → inspection → 14-day hold → payout, chat, disputes, admin desks |
| D | The Lab: dark theme, home, tools (batch 1: ~30 browser-side tools), playbooks, forum, upgrade/redeem, 404 |
| E | Lab tools batch 2 (network/recon via server proxies), temp mail, CopyPaste |
| F | Polish pass on every page (desktop + mobile), tests + UAT, docs, deploy |

Each phase ships to `main` and the VPS/Vercel as it lands.
