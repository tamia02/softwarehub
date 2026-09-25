/**
 * The Lab catalogue — browser-side developer & security tools, grouped by
 * category and tier. All run client-side or against public data; nothing here
 * is a fraud/abuse tool. Written for us.
 */
export type LabTier = "Free" | "Pro" | "VIP";
export interface LabTool {
  name: string;
  desc: string;
  tier: LabTier;
}
export interface LabGroup {
  group: string;
  tools: LabTool[];
}

const t = (name: string, desc: string, tier: LabTier = "Free"): LabTool => ({ name, desc, tier });

export const labCatalog: LabGroup[] = [
  {
    group: "Decode & Convert",
    tools: [
      t("JWT Reader", "Inspect a token's header, claims and expiry."),
      t("Base64 Encoder / Decoder", "Text ⇄ Base64, UTF-8 and base64url."),
      t("Hex ⇄ Text", "Convert text to hex bytes and back."),
      t("URL Encoder / Parser", "Percent-encode and split links into parts."),
      t("JSON Formatter", "Beautify, minify and validate JSON."),
      t("CSV ⇄ JSON", "Convert between CSV and structured JSON."),
      t("Unix Timestamp", "Epoch ⇄ readable UTC and local dates."),
      t("Cron Reader", "Translate a cron schedule into plain English."),
      t("Colour Converter", "HEX ⇄ RGB ⇄ HSL with contrast check."),
      t("Regex Tester", "Live matches with capture groups and index."),
      t("Text Diff", "Compare two blocks line by line."),
      t("Number Base Converter", "Bin / oct / dec / hex conversions.", "Pro"),
    ],
  },
  {
    group: "Domain & Network",
    tools: [
      t("DNS Lookup", "A, AAAA, MX, TXT, NS, CNAME over DoH."),
      t("WHOIS", "Registrar and expiry data for a domain."),
      t("HTTP Header Grader", "Grade a site's security headers."),
      t("My IP & Network", "Public IP, ISP, ASN and location."),
      t("SSL Certificate Viewer", "Inspect a site's TLS certificate.", "Pro"),
      t("Subdomain Finder", "Discover subdomains via certificate logs.", "Pro"),
      t("IP Geolocation", "Country, ASN and carrier for an IP."),
      t("robots.txt / sitemap", "Fetch and read a site's crawl rules."),
      t("Tech Stack Detector", "Detect a public site's frameworks.", "Pro"),
      t("Ping / Latency", "Measure round-trip time from the browser."),
    ],
  },
  {
    group: "Security Checks",
    tools: [
      t("Breach Checker", "Is an email in a known breach? (k-anonymity)"),
      t("Password Strength", "Entropy and estimated crack time."),
      t("Password Generator", "Strong random passwords and passphrases."),
      t("Email Validator", "MX + disposable-domain check."),
      t("Email Header Analyser", "Trace hops, read SPF / DKIM / DMARC."),
      t("URL Safety Check", "Flag phishing / unsafe URLs.", "Pro"),
      t("Hash Calculator", "MD5 / SHA-1 / SHA-256 / SHA-512."),
      t("Hash Identifier", "Guess the algorithm of a hash."),
      t("HMAC Generator", "Compute keyed HMAC signatures.", "Pro"),
      t("CSP Evaluator", "Review a Content-Security-Policy.", "Pro"),
    ],
  },
  {
    group: "Files & Generators",
    tools: [
      t("EXIF Reader & Stripper", "Read and remove photo metadata."),
      t("QR Generator & Reader", "Create and decode QR codes offline."),
      t("Image → Base64", "Inline an image as a data URL."),
      t("Favicon Generator", "Build favicons from an image.", "Pro"),
      t("Test Persona", "Generate clearly-synthetic test data for QA."),
      t("Lorem Ipsum", "Placeholder text in any length."),
      t("Placeholder Image", "Sized placeholder images on demand."),
      t("UUID / Token Generator", "Secure UUID v4 and random tokens."),
      t("PDF Metadata Reader", "Read a PDF's metadata locally.", "Pro"),
    ],
  },
  {
    group: "Recon (public data)",
    tools: [
      t("Username Availability", "Check a username across platforms."),
      t("Reverse IP", "Domains sharing an IP.", "Pro"),
      t("DNS Map", "Map a domain's public DNS infrastructure.", "Pro"),
      t("Wayback Snapshots", "Find archived versions of a page."),
      t("Google Dork Builder", "Compose advanced search queries."),
    ],
  },
  {
    group: "Utilities",
    tools: [
      t("CopyPaste", "Share text between your own devices by code."),
      t("Temp Mail", "A disposable inbox on our own domain.", "Pro"),
      t("Markdown Preview", "Live-render Markdown to HTML."),
      t("Case / Slug Converter", "camelCase, snake_case, kebab-slug."),
      t("Countdown / Timer", "Simple countdowns and stopwatches."),
      t("VIP Vault", "Early access to every new tool and playbook.", "VIP"),
      t("Private Playbooks", "Advanced growth & hardening guides.", "VIP"),
    ],
  },
];

export const labStats = {
  total: labCatalog.reduce((n, g) => n + g.tools.length, 0),
  free: labCatalog.reduce((n, g) => n + g.tools.filter((x) => x.tier === "Free").length, 0),
  pro: labCatalog.reduce((n, g) => n + g.tools.filter((x) => x.tier === "Pro").length, 0),
  vip: labCatalog.reduce((n, g) => n + g.tools.filter((x) => x.tier === "VIP").length, 0),
};
