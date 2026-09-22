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

### 1.3a Verified details from the live site (added after full crawl)
- Hero counters on the live site read **50K+ happy customers · 5M+ orders · 99.9% satisfaction**; services page header reads **5 categories · 150+ services · 99.9% uptime**; other pages claim 539+ / 1,400+ / 2,500+ services. Ours are computed from the DB, never hard-coded.
- Login is **username + password** (not email), "Remember me", "Forgot password", Google sign-in. Register fields: **username, full name, e-mail, WhatsApp number, password, confirm, accept terms**; Google sign-up. We keep OTP as an option but add username/password to match.
- Reseller tiers are named two ways on the site (Bronze/Silver/Gold on the homepage, Starter/Pro Reseller/Elite Master on the plans page). We use one set: **Bronze ₹49 / 7 days · Silver ₹249 / 30 days · Gold ₹499 / 90 days**, each "single account / 1 device", with the feature ladder (API rate limit → dedicated nodes → unlimited throughput; ticket support → 1-on-1 WhatsApp → admin hotline). "Buy via WhatsApp" and "Redeem licence key" buttons; membership status card ("Standard customer — upgrade to unlock").
- Services page: platform chips (All, Instagram, YouTube, TikTok, Telegram, Facebook, Twitter/X, Spotify, Discord, OTT & Canva, AI & Tools, Web Traffic), category accordion with counts, currency selector, table with service ID `#0034` style, tag pills (Instant start, High quality, Refill guarantee, Non-drop), min–max, avg time shown as **"Members only"** when logged out, Details + Order buttons.
- FAQ page items: what is an SMM panel, service kinds, account safety, **mass order**, **drip-feed**, processing speed, plus the 7 homepage FAQs.
- Footer status pill "All systems operational", WhatsApp 24/7 badge, "256-bit SSL", "Instant API dispatch" trust row.
- Terms page structure (10 numbered sections, effective date, governing law India / DPDP, anti-chargeback clause, wallet funds non-withdrawable, auto-refund of cancelled remains to wallet).
- Not accessible without an account (reconstructed from the public pages, the API doc and the standard SMM-panel layout the site is built on): dashboard → New order · Mass order · Orders · Services · Add funds · Refill · Tickets · API · Affiliates · Child panel · Updates · Account (timezone, 2FA, API key). All are in §1.3.

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

### 2.6a Verified mechanics (from G2G's help centre — 25 articles read)

**Seller ranking** (recomputed monthly, GMT+8): Normal < $300 · Common ≥ $300 · Uncommon ≥ $1k · Rare ≥ $5k · Epic ≥ $10k · Legendary ≥ $20k monthly sales. Upgrade needs > 90 % positive rating; downgrade only after **two consecutive** missed months. Separate **user level** ("Lvl 142") from completed orders. Ours: same ladder in INR (₹25k / ₹80k / ₹4L / ₹8L / ₹16L), admin-editable.

**Commission by rank × product type** (no listing fees):

| Product | Normal | Common | Uncommon | Rare | Epic | Legendary |
|---|---|---|---|---|---|---|
| Other services | 9.99 | 8.99 | 7.99 | 6.99 | 5.99 | 4.99 |
| Account services | 12.99 | 11.99 | 10.99 | 9.99 | 8.99 | 7.99 |
| Software / AI-tool accounts | 19.99 | 18.99 | 17.99 | 16.99 | 15.99 | 14.99 |

Flat 9.99 % for coaching/GamePal; promotional flat 4.99 % for top-ups, gift cards, software, video games. Ours: same matrix, admin-editable, shown on the seller page and in the finance ledger per order.

**Order state machine** (buyer view / seller view):
`Order placed → To pay → Verifying payment → Paid (buyer EKYC if required) → Preparing (seller viewed general details) → Prepared (seller viewed recipient details) → Delivering (partial allowed) → Delivered → Completed` plus `Cancelled` and `Resolution` (dispute). Rules: seller must not deliver before "Paid"; if not moved to Preparing within **48 h** → auto-cancel + refund; buyer cancel request → instant if not yet viewed, else seller has **6 h** (Preparing) / **48 h** (Delivering) to accept or reject with written reason or image proof, no response → auto-cancel; after a rejected/withdrawn request the buyer waits **1 h** before another; once the seller confirms delivery the buyer can no longer cancel, only report. Auto-complete **3 days** after full delivery if the buyer doesn't confirm. Gift-card/code orders deliver instantly and auto-cancel on payment failure.

**Seller credit release**: other products 15 min – 24 h after Completed; **account/device products 14 days** (the insured period) — matches the 14-day hold you asked for. Credit → *Available balance* → withdrawal (auto-remittance opt-in or manual request with a payment-request ID). Beneficiary name must match profile name; withdrawal may trigger a fresh ID check; per-method min/max and fee tables by rank (e.g. bank 2.99 % + fixed for Normal, 0.99 % for Legendary); crypto network fee borne by seller; available balance cannot be spent on the platform.

**Buyer wallets**: *Store credit* (refunds land here, spendable at checkout, no top-up, one-time currency change, refund-to-source on request) and *Points* (earned per purchase, redeem up to 25 % of order total in multiples of 100, not on boosting). Ours: one wallet + points, same rules.

**Dispute flow**: order page **Report** (pick reason) → seller has 48 h → **Escalate** → specialist review; no buyer action within 48 h → auto-close; **Resolve escalate** to resume delivery or confirm-then-cancel remainder; completed orders → support ticket only. Services use **Not received** while Processing. Seller can also issue a refund on a completed order.

**Delivery proof**: uploaded on the sold-order page only (jpg/png/gif/mp4/mov…, 100 MB/file, 150 files/order), per-category requirements (accounts: credentials screenshot, unbinding proof, login alerts, remaining duration; codes: redemption proof; services: before/after). Missing proof = seller loses the dispute.

**Listings**: verified sellers up to 2,000 offers; **bulk listing** via downloadable XLS template → upload → preview (expires in 1 h) → "Invalid listing" tab → confirm; manage = deactivate / delete / extend / edit (description, delivery method, price, stock). Offer-group page = one product with **"Other sellers (n)"** ranked, "Other denominations", seller card (level, rank badge, 90-day %, completed count, online dot, Chat), product info (region restriction, delivery speed, delivery method), rich description, reviews % + count, sold count.

**Rules encoded as validation**: subscriptions max 1 month per listing; software/app accounts only for level ≥ 30; warranty text can't exceed platform standard (14 days accounts / 1 month subs); no external links/QR in store name or images; no duplicates; no keyword stuffing; original descriptions; secure code/password delivery via the order page (never chat); replacement accounts only via order page; high-risk seller flag after complaint volume → protection withdrawn, payouts held; 72-h self-resolution exempts from penalty; appeal process.

**Accounts & KYC**: sign-up via mobile number OTP (no VoIP), or Google/Facebook; ID verification = country + document type → front/back capture (glare checks, OCR review) → selfie liveness with countdown → email confirmation; **Business account** = company name, registration no., tax no., addresses, representative (director or authorised with letter), business certificate, director list, proof of address, 48-h review. Phone/payment-country mismatch triggers verification.

**Also on G2G**: Affiliate program (20 % revenue share, lifetime on referred users, reflinks per product, dashboard, withdrawal, leaderboard, FAQ); Rent-time services (coaching / companion sessions booked by date & time, flat commission) — ours becomes **Expert sessions** (tool onboarding/consulting by resellers); Help centre with ticket submit/my tickets and 6 categories; Legal hub (privacy, advertising policy, terms, affiliate agreement, listing policy, protection, payment schedule, refund policy, seller rules); country/currency selector; day/night toggle; cookie notice; search with top searches; "Trending brands" strips with offer counts on every category page.

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

### 3.3a What the crawl of madleets.me confirmed (20 pages)
- Structure kept: sidebar nav (Dashboard, All tools, tool shortcuts, Forum, Public threads, Pro zone, VIP zone), top search with ⌘K, "NEW" announcement strip, home hero with stats (tools, page views, members, premium, playbooks, VIP threads), "What's new" feed, streak + top contributors, latest threads, tool tiers Free 52 / Pro 17 / VIP 12 with a "20+ new tools" explainer grid, forum directory with **sections and tags**, thread counters (replies, views, date), upgrade page with **6-month / 1-year / lifetime** cards, strike-through pricing and "-70 %" badges, redeem code, donate, contact form + Telegram, advertise-with-us card, terminal-style 404 with trace ID.
- Legit tools verified on the site and included in §3.2 (BIN lookup stays **only** as the public 6/8-digit issuer lookup for merchants/devs — never a "live checker").
- Confirmed and **excluded** with the site's own wording: "Full VIP Zone access (Leaks, Cracked Software, Courses, License Keys, VIP Methods, VIP BINs)", "Private Auto Hitter", "Private BINs Database — exclusive working BINs", "Untested Methods vault", "password cracking tools", "Exclusive VIP courses (FB Monetization, **Carding**, OPSEC)", forum sections **Bins / Cookies / Hitters**, the Netflix cookie section, shared "VPN credentials", **temp phone numbers** for SMS-verification bypass, and the fake-documents generator. Temp **mail** on our own domain is kept (ordinary dev/QA tool).

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

---

## 7. Verification log (22 Sep 2026)

| Site | Pages read | Notes |
|---|---|---|
| g2g.com | 30 pages: home, login, seller, GamerProtect, affiliate, legal hub, terms, privacy, 14 trending/category pages, 2 category listings, offer-group page, seller profile, coaching, GamePal, search | `/about-us`, `/help`, `/business` return 404 or blank (About links to hydron.holdings; help is support.g2g.com) |
| support.g2g.com | 25 articles: category indexes (Account, General, Buying, Selling, GamerProtect, Affiliate) + commission, payout schedule, withdrawal, KYC steps, KYC why, business account, seller rules, listing policy, software-account rules, bulk listing, offers, sell-order states, buy-order states, store credit, points, disputes, delivery-proof (accounts), trust, sign-up, not-confirmed, ranking | Everything behind "My G2G" (dashboard, checkout, chat) is reconstructed from these articles |
| socialbazarsmm.com | 9 pages: home, services, reseller, API, terms, FAQ, signup, login card, footer | Dashboard requires an account with a WhatsApp number; not created — reconstructed from API doc + standard SMM-panel layout |
| madleets.me | 20 pages: home, all tools, threads, temp numbers, BIN checker, upgrade, contact, donate, auth, Netflix, and 404s for vip / pro / cc-generator / forum / vpn / temp-mail / documents / redeem (behind login or renamed) | Pro/VIP content is described on the upgrade page; not purchased |

Method: headless Chromium, full-page text + link extraction per page, three retries per URL. Raw dumps kept in the session scratchpad (`crawl/`).
