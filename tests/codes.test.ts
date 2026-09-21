import { describe, expect, it } from "vitest";
import { codeKind, computeCheckChar, displayCode, hasValidCheckChar, maskCode, normalizeCode, preflightGateCode } from "@/lib/codes";
import { generateCode, hashCode } from "@/lib/codes.server";

describe("activation codes (§5)", () => {
  it("normalises and masks input", () => {
    expect(normalizeCode(" shp-c-ab12-cd34 ")).toBe("SHPCAB12CD34");
    expect(maskCode("SHPCAB12CD34")).toBe("SHPC-AB12-CD34");
    expect(displayCode("SHPPABCDEFGHJKLM")).toBe("SHP-P-ABCD-EFGH-JKLM");
  });

  it("generated codes carry a valid check character and the right prefix/length", () => {
    for (const kind of ["gate-customer", "gate-reseller", "bundle-pro", "bundle-starter"] as const) {
      const c = generateCode(kind);
      expect(c.length).toBe(kind.startsWith("gate") ? 12 : 16);
      expect(hasValidCheckChar(c)).toBe(true);
      expect(codeKind(c)).toBe(kind);
    }
  });

  it("detects single-character typos and adjacent transpositions", () => {
    const c = generateCode("gate-customer");
    const body = c.slice(0, -1);
    expect(computeCheckChar(body)).toBe(c[11]);
    const typo = c.slice(0, 5) + (c[5] === "A" ? "B" : "A") + c.slice(6);
    expect(hasValidCheckChar(typo)).toBe(false);
    // transposition of two different adjacent characters
    let i = 4;
    while (i < 10 && c[i] === c[i + 1]) i++;
    const swapped = c.slice(0, i) + c[i + 1] + c[i] + c.slice(i + 2);
    expect(hasValidCheckChar(swapped)).toBe(false);
  });

  it("preflight rejects bundle codes at the gate and typos, allows demo codes", () => {
    expect(preflightGateCode("CUST-DEMO-2026")).toBeNull();
    expect(preflightGateCode(generateCode("bundle-pro"))).toMatch(/bundle code/);
    const good = generateCode("gate-customer");
    const typo = good.slice(0, 6) + (good[6] === "A" ? "B" : "A") + good.slice(7);
    expect(preflightGateCode(typo)).toMatch(/typo/);
    expect(preflightGateCode(generateCode("gate-reseller"))).toBeNull();
  });

  it("hashes are salted, deterministic and format-insensitive", () => {
    expect(hashCode("cust-demo-2026")).toBe(hashCode("CUSTDEMO2026"));
    expect(hashCode("A")).not.toBe(hashCode("B"));
    expect(hashCode("A")).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("ISO 7064 MOD 37-2 guarantees", () => {
  it("never emits the * check symbol from the generator", () => {
    for (let n = 0; n < 500; n++) expect(generateCode("bundle-pro")).not.toContain("*");
  });

  it("detects every adjacent transposition and single substitution across many random codes", () => {
    for (let n = 0; n < 300; n++) {
      const c = generateCode(n % 2 ? "bundle-pro" : "gate-customer");
      for (let i = 0; i < c.length - 2; i++) {
        if (c[i] === c[i + 1]) continue;
        const swapped = c.slice(0, i) + c[i + 1] + c[i] + c.slice(i + 2);
        expect(hasValidCheckChar(swapped)).toBe(false);
      }
      for (let i = 0; i < c.length - 1; i++) {
        const alt = c[i] === "A" ? "B" : "A";
        const sub = c.slice(0, i) + alt + c.slice(i + 1);
        expect(hasValidCheckChar(sub)).toBe(false);
      }
    }
  });
});
