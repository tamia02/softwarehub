import "server-only";

/**
 * Server-only client for the existing WhatsApp/vending bot (vending-deep-agent).
 * The admin token never reaches the browser — only server components / route
 * handlers import this. Reached over the vending-bot_default Docker network.
 */
const BASE = (process.env.VENDING_API_URL ?? "http://vending-deep-agent:5000").replace(/\/$/, "");
const TOKEN = process.env.VENDING_ADMIN_TOKEN ?? "";

export type VendingResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

async function call<T>(path: string, init?: RequestInit): Promise<VendingResult<T>> {
  if (!TOKEN && path.startsWith("/api/admin")) {
    return { ok: false, error: "VENDING_ADMIN_TOKEN is not set on the server." };
  }
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        "X-Admin-Token": TOKEN,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = JSON.parse(text);
    } catch {
      /* keep as text */
    }
    if (!res.ok) {
      const msg = typeof data === "object" && data ? JSON.stringify(data) : String(data);
      return { ok: false, error: msg.slice(0, 300), status: res.status };
    }
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}

export const vendingGet = <T>(path: string) => call<T>(path);
export const vendingSend = <T>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) =>
  call<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

/* ---- Shapes we render (loose — the bot owns the schema) ---- */
export interface VHealth {
  status?: string;
  database?: string;
  engine?: string;
  env?: string;
  model?: string;
  admin_auth_required?: boolean;
}
export interface VProduct {
  id: number;
  name: string;
  category?: string;
  base_price?: number;
  customer_price?: number;
  reseller_price?: number;
  credit_cost?: number;
  in_stock?: boolean | number;
  stock?: number;
}
export interface VReseller {
  id: number;
  name?: string;
  phone?: string;
  currency?: string;
  credits_balance?: number;
  wallet_balance?: number;
  balance_display?: string;
  is_active?: boolean;
  locked_until?: string | null;
  failed_attempts?: number;
}
export interface VLink {
  id: number;
  is_used?: boolean;
  status?: string;
}
export interface VOrder {
  id: string;
  status?: string;
  created_at?: string;
  product_name?: string;
  amount?: number;
  total?: number;
  phone?: string;
}
