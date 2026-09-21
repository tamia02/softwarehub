import { describe, expect, it } from "vitest";
import { grandTotalUsd, seatPricePaise, tierPricing, tierRetailUsd } from "@/lib/pricing";
import { formatINR, formatINRApprox, formatINRCompact } from "@/lib/format";

describe("pricing (§2)", () => {
  it("matches the catalog totals from the guide", () => {
    expect(tierRetailUsd("starter")).toBe(36_318);
    expect(tierRetailUsd("pro")).toBe(40_214);
    expect(grandTotalUsd).toBe(40_214);
  });
  it("computes savings at the configured rate", () => {
    const p = tierPricing("pro", 84);
    expect(p.retailPaise).toBe(40_214 * 84 * 100);
    expect(p.savingsPct).toBe(98.6);
    expect(tierPricing("starter", 84).savingsPct).toBe(99.2);
  });
  it("seat price rounds up so pools never under-collect", () => {
    expect(seatPricePaise("pro", 10)).toBe(470_000);
    expect(seatPricePaise("starter", 7) * 7).toBeGreaterThanOrEqual(2_500_000);
  });
  it("formats INR with Indian grouping", () => {
    expect(formatINR(305_071_200)).toBe("₹30,50,712");
    expect(formatINRApprox(305_071_200)).toBe("≈ ₹30,51,000");
    expect(formatINRCompact(337_797_600)).toBe("₹33.8 L");
  });
});
