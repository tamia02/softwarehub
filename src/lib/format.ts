const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** ₹25,000 — Indian digit grouping (lakh / crore). */
export function formatINR(paise: number): string {
  return inr.format(Math.round(paise / 100));
}

/** 25,000 (no symbol). */
export function formatINRNumber(paise: number): string {
  return inrNumber.format(Math.round(paise / 100));
}

/** ≈ ₹30,50,000 — rounded to the nearest thousand for "illustrative" figures. */
export function formatINRApprox(paise: number): string {
  const rupees = Math.round(paise / 100 / 1000) * 1000;
  return `≈ ${inr.format(rupees)}`;
}

export function formatUSD(value: number): string {
  return usd.format(value);
}

/** 30.5 lakh / 3.4 Cr — compact spoken form for headlines. */
export function formatINRCompact(paise: number): string {
  const r = paise / 100;
  if (r >= 1e7) return `₹${(r / 1e7).toFixed(r % 1e7 === 0 ? 0 : 1)} Cr`;
  if (r >= 1e5) return `₹${(r / 1e5).toFixed(r % 1e5 === 0 ? 0 : 1)} L`;
  return inr.format(r);
}

export function formatPct(pct: number): string {
  return `${pct.toFixed(1)}%`;
}

/** ₹47,000 · $560 — INR with an approximate USD equivalent at the configured rate. */
export function formatDual(paise: number, usdInrRate: number): string {
  return `${formatINR(paise)} · ${usd.format(paise / 100 / usdInrRate)}`;
}

/** ≈ $560 */
export function formatUSDFromPaise(paise: number, usdInrRate: number): string {
  return `≈ ${usd.format(paise / 100 / usdInrRate)}`;
}
