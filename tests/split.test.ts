import { describe, expect, it } from "vitest";
import { computeSplit, splitTies, splitToCsv, SplitError } from "@/lib/split";

const members = Array.from({ length: 10 }, (_, i) => ({ userId: `u${i}`, paidPaise: 250_000 }));

describe("revenue split engine (§6.2)", () => {
  it("reseller keeps margin: gross − cost − fee", () => {
    const r = computeSplit({ members, resellerCostPaise: 2_000_000, feePct: 2, mode: "reseller_keeps" });
    expect(r.grossPaise).toBe(2_500_000);
    expect(r.platformFeePaise).toBe(50_000);
    expect(r.marginPaise).toBe(450_000);
    expect(r.resellerSharePaise).toBe(450_000);
    expect(r.memberShares.every((m) => m.sharePaise === 0)).toBe(true);
    expect(splitTies(r)).toBe(true);
  });

  it("share_equal splits margin evenly and ties to the paisa", () => {
    const r = computeSplit({ members: members.slice(0, 7), resellerCostPaise: 1_000_000, feePct: 2, mode: "share_equal" });
    // gross 1,750,000 − fee 35,000 − cost 1,000,000 = 715,000 / 7 = 102,142.857…
    expect(r.memberShares.every((m) => m.sharePaise === 102_142)).toBe(true);
    expect(r.resellerSharePaise).toBe(715_000 - 102_142 * 7); // rounding remainder → reseller
    expect(splitTies(r)).toBe(true);
  });

  it("custom percentages must sum to 100", () => {
    expect(() => computeSplit({ members, resellerCostPaise: 0, feePct: 0, mode: "custom", customPct: { u0: 50 } })).toThrow(SplitError);
    const r = computeSplit({ members, resellerCostPaise: 2_000_000, feePct: 2, mode: "custom", customPct: { reseller: 60, u0: 20, u1: 20 } });
    expect(r.memberShares.find((m) => m.userId === "u0")?.sharePaise).toBe(90_000);
    expect(r.resellerSharePaise).toBe(450_000 - 180_000);
    expect(splitTies(r)).toBe(true);
  });

  it("rejects negative margin", () => {
    expect(() => computeSplit({ members: members.slice(0, 2), resellerCostPaise: 2_000_000, feePct: 2, mode: "reseller_keeps" })).toThrow(/Negative margin/);
  });

  it("produces a CSV statement", () => {
    const r = computeSplit({ members: members.slice(0, 2), resellerCostPaise: 100_000, feePct: 2, mode: "share_equal" });
    const csv = splitToCsv(r, { u0: "Asha" });
    expect(csv.split("\n")[0]).toBe('"line","party","amount_inr"');
    expect(csv).toContain('"member_share","Asha"');
  });
});
