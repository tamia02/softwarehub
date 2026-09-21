/**
 * Reseller revenue split engine (§6.2). Pure and integer-only (paise) so it
 * can be unit-tested and the result stored immutably per pool.
 *
 *   gross          = sum(member payments)
 *   platform_fee   = gross × fee_pct
 *   reseller_cost  = reseller price for the code
 *   margin         = gross − reseller_cost − platform_fee
 *
 * Modes:
 *   reseller_keeps  reseller takes the whole margin
 *   share_equal     margin split equally between members (credit per member)
 *   custom          caller supplies percentages keyed by userId or "reseller"; must sum to 100
 */

export type SplitMode = "reseller_keeps" | "share_equal" | "custom";

export interface SplitMember {
  userId: string;
  paidPaise: number;
}

export interface SplitInput {
  members: SplitMember[];
  resellerCostPaise: number;
  feePct: number;
  mode: SplitMode;
  customPct?: Record<string, number>;
}

export interface SplitResult {
  mode: SplitMode;
  grossPaise: number;
  platformFeePaise: number;
  resellerCostPaise: number;
  marginPaise: number;
  resellerSharePaise: number;
  memberShares: Array<{ userId: string; sharePaise: number }>;
  computedAt: string;
}

export class SplitError extends Error {}

export function computeSplit(input: SplitInput): SplitResult {
  const gross = input.members.reduce((s, m) => s + m.paidPaise, 0);
  const fee = Math.round((gross * input.feePct) / 100);
  const margin = gross - input.resellerCostPaise - fee;
  if (margin < 0) throw new SplitError(`Negative margin: gross ${gross} < cost ${input.resellerCostPaise} + fee ${fee}`);

  let resellerShare = 0;
  const memberShares = input.members.map((m) => ({ userId: m.userId, sharePaise: 0 }));

  if (input.mode === "reseller_keeps") {
    resellerShare = margin;
  } else if (input.mode === "share_equal") {
    const n = memberShares.length || 1;
    const each = Math.floor(margin / n);
    memberShares.forEach((s) => (s.sharePaise = each));
    // Remainder paise go to the reseller so the statement always ties.
    resellerShare = margin - each * memberShares.length;
  } else {
    const pct = input.customPct ?? {};
    const total = Object.values(pct).reduce((s, v) => s + v, 0);
    if (Math.abs(total - 100) > 0.0001) throw new SplitError(`Custom percentages sum to ${total}, expected 100`);
    let allocated = 0;
    for (const s of memberShares) {
      s.sharePaise = Math.floor((margin * (pct[s.userId] ?? 0)) / 100);
      allocated += s.sharePaise;
    }
    resellerShare = margin - allocated; // reseller's pct + rounding remainder
  }

  return {
    mode: input.mode,
    grossPaise: gross,
    platformFeePaise: fee,
    resellerCostPaise: input.resellerCostPaise,
    marginPaise: margin,
    resellerSharePaise: resellerShare,
    memberShares,
    computedAt: new Date().toISOString(),
  };
}

/** Sanity check used by tests and the fulfilment path. */
export function splitTies(r: SplitResult): boolean {
  const members = r.memberShares.reduce((s, m) => s + m.sharePaise, 0);
  return r.platformFeePaise + r.resellerCostPaise + r.resellerSharePaise + members === r.grossPaise;
}

/** Downloadable statement rows (CSV). */
export function splitToCsv(r: SplitResult, names: Record<string, string> = {}): string {
  const rows = [
    ["line", "party", "amount_inr"],
    ["gross", "pool members", (r.grossPaise / 100).toFixed(2)],
    ["platform_fee", "platform", (-r.platformFeePaise / 100).toFixed(2)],
    ["reseller_cost", "reseller (code cost)", (-r.resellerCostPaise / 100).toFixed(2)],
    ["margin", "", (r.marginPaise / 100).toFixed(2)],
    ["reseller_share", "reseller", (r.resellerSharePaise / 100).toFixed(2)],
    ...r.memberShares.map((m) => ["member_share", names[m.userId] ?? m.userId, (m.sharePaise / 100).toFixed(2)]),
  ];
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}
