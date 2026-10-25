import { createHash, createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { verifyTelegramLogin } from "@/lib/telegram-auth.server";

const TOKEN = "123456:TEST-token-for-unit-tests";

/** Sign fields exactly as Telegram's Login Widget does. */
function signed(fields: Record<string, string>, token = TOKEN) {
  const check = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join("\n");
  const hash = createHmac("sha256", createHash("sha256").update(token).digest()).update(check).digest("hex");
  return new URLSearchParams({ ...fields, hash });
}

describe("Telegram login verification", () => {
  const saved = process.env.LUCIFER_BOT_TOKEN;
  beforeEach(() => {
    process.env.LUCIFER_BOT_TOKEN = TOKEN;
  });
  afterEach(() => {
    process.env.LUCIFER_BOT_TOKEN = saved;
  });
  const now = () => String(Math.floor(Date.now() / 1000));

  it("accepts a correctly signed payload and keeps 64-bit ids as strings", () => {
    const p = signed({ id: "8702297664", first_name: "Asha", username: "asha", auth_date: now() });
    expect(verifyTelegramLogin(p)).toEqual({ id: "8702297664", firstName: "Asha", lastName: "", username: "asha" });
  });

  it("rejects a tampered field", () => {
    const p = signed({ id: "8702297664", first_name: "Asha", auth_date: now() });
    p.set("id", "1111");
    expect(verifyTelegramLogin(p)).toBeNull();
  });

  it("rejects a payload signed with another bot's token", () => {
    expect(verifyTelegramLogin(signed({ id: "1", auth_date: now() }, "999:other"))).toBeNull();
  });

  it("rejects stale logins (older than a day)", () => {
    const old = String(Math.floor(Date.now() / 1000) - 2 * 86400);
    expect(verifyTelegramLogin(signed({ id: "1", auth_date: old }))).toBeNull();
  });

  it("rejects everything when the bot token is not configured", () => {
    process.env.LUCIFER_BOT_TOKEN = "";
    expect(verifyTelegramLogin(signed({ id: "1", auth_date: now() }))).toBeNull();
  });

  it("ignores unknown extra params instead of signing them", () => {
    const p = signed({ id: "42", auth_date: now() });
    p.set("next", "/account");
    expect(verifyTelegramLogin(p)?.id).toBe("42");
  });
});
