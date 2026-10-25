"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";
import { methodTools, type MethodToolId } from "@/data/methodTools";

/* ---------- individual tools (all run in the browser) ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
      {children}
    </label>
  );
}
const ta = "w-full rounded-[8px] border border-line-strong bg-bg-card p-3 font-code text-[13px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15";
const out = "mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-[8px] border border-line bg-bg p-3 font-code text-[13px] text-ink";
const lbl = "mt-3 text-[12px] font-semibold text-ink-faint";
const btn = "inline-flex h-10 items-center rounded-[8px] bg-primary px-4 text-[13px] font-semibold text-white hover:bg-[#1c2436]";

function Base64Tool() {
  const [t, setT] = useState("");
  let enc = "", dec = "";
  try { enc = t ? btoa(unescape(encodeURIComponent(t))) : ""; } catch { enc = "(can't encode)"; }
  try { dec = t ? decodeURIComponent(escape(atob(t.trim()))) : ""; } catch { dec = "(not valid Base64)"; }
  return (<div><Field label="Text or Base64"><textarea className={ta} rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="Type text to encode, or paste Base64 to decode" /></Field><p className={lbl}>Encoded →</p><div className={out}>{enc || "…"}</div><p className={lbl}>Decoded →</p><div className={out}>{dec || "…"}</div></div>);
}

function JwtTool() {
  const [t, setT] = useState("");
  const parse = (seg?: string) => { try { return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob((seg ?? "").replace(/-/g, "+").replace(/_/g, "/"))))), null, 2); } catch { return "(invalid)"; } };
  const [h, p] = t.split(".");
  return (<div><Field label="JWT"><textarea className={ta} rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="eyJhbGciOi..." /></Field><p className={lbl}>Header →</p><div className={out}>{t ? parse(h) : "…"}</div><p className={lbl}>Payload →</p><div className={out}>{t ? parse(p) : "…"}</div></div>);
}

function HashTool() {
  const [t, setT] = useState(""); const [h, setH] = useState("");
  async function run() { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); setH([...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")); }
  return (<div><Field label="Text"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} onKeyUp={run} placeholder="Anything" /></Field><p className={lbl}>SHA-256 →</p><div className={out}>{h || "…"}</div></div>);
}

function JsonTool() {
  const [t, setT] = useState(""); let res = "";
  try { res = t ? JSON.stringify(JSON.parse(t), null, 2) : ""; } catch (e) { res = `✗ ${e instanceof Error ? e.message : "invalid JSON"}`; }
  return (<div><Field label="JSON"><textarea className={ta} rows={5} value={t} onChange={(e) => setT(e.target.value)} placeholder='{"a":1}' /></Field><p className={lbl}>Formatted →</p><div className={out}>{res || "…"}</div></div>);
}

function UrlTool() {
  const [t, setT] = useState("");
  let enc = "", dec = "";
  try { enc = t ? encodeURIComponent(t) : ""; } catch {}
  try { dec = t ? decodeURIComponent(t) : ""; } catch { dec = "(invalid)"; }
  return (<div><Field label="Text or URL"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} /></Field><p className={lbl}>Encoded →</p><div className={out}>{enc || "…"}</div><p className={lbl}>Decoded →</p><div className={out}>{dec || "…"}</div></div>);
}

function UuidTool() {
  const [ids, setIds] = useState<string[]>([]);
  return (<div><button onClick={() => setIds(Array.from({ length: 5 }, () => crypto.randomUUID()))} className={btn}>Generate 5 UUIDs</button><div className={out}>{ids.length ? ids.join("\n") : "…"}</div></div>);
}

function PasswordTool() {
  const [len, setLen] = useState(16); const [pw, setPw] = useState("");
  function gen() { const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*"; const a = crypto.getRandomValues(new Uint32Array(len)); setPw([...a].map((n) => c[n % c.length]).join("")); }
  return (<div><Field label={`Length: ${len}`}><input type="range" min={8} max={40} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-[var(--brand-accent)]" /></Field><button onClick={gen} className={`mt-2 ${btn}`}>Generate</button><div className={`${out} select-all`}>{pw || "…"}</div></div>);
}

function CaseTool() {
  const [t, setT] = useState("");
  const rows: [string, string][] = [["UPPER", t.toUpperCase()], ["lower", t.toLowerCase()], ["Title", t.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())], ["kebab", t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")], ["snake", t.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")]];
  return (<div><Field label="Text"><textarea className={ta} rows={2} value={t} onChange={(e) => setT(e.target.value)} /></Field><div className={out}>{t ? rows.map(([k, v]) => `${k}: ${v}`).join("\n") : "…"}</div></div>);
}

function HexTool() {
  const [t, setT] = useState("");
  const toHex = t ? [...new TextEncoder().encode(t)].map((b) => b.toString(16).padStart(2, "0")).join(" ") : "";
  let fromHex = ""; try { const clean = t.replace(/[^0-9a-fA-F]/g, ""); if (clean.length % 2 === 0 && clean) fromHex = new TextDecoder().decode(new Uint8Array(clean.match(/.{2}/g)!.map((h) => parseInt(h, 16)))); } catch {}
  return (<div><Field label="Text or hex"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} /></Field><p className={lbl}>Text → Hex</p><div className={out}>{toHex || "…"}</div><p className={lbl}>Hex → Text</p><div className={out}>{fromHex || "…"}</div></div>);
}

function TimestampTool() {
  const [t, setT] = useState(String(Math.floor(Date.now() / 1000)));
  const n = Number(t); const d = n ? new Date(n > 1e12 ? n : n * 1000) : null;
  return (<div><Field label="Unix timestamp"><input className={ta} value={t} onChange={(e) => setT(e.target.value)} /></Field><div className={out}>{d && !isNaN(d.getTime()) ? `UTC:   ${d.toUTCString()}\nLocal: ${d.toString()}` : "…"}</div><button onClick={() => setT(String(Math.floor(Date.now() / 1000)))} className={`mt-3 ${btn}`}>Now</button></div>);
}

const COMPONENTS: Record<MethodToolId, () => React.JSX.Element> = {
  Base64Tool,
  JwtTool,
  HashTool,
  JsonTool,
  UrlTool,
  UuidTool,
  PasswordTool,
  CaseTool,
  HexTool,
  TimestampTool,
};

const TOOLS = methodTools.map((t) => ({ ...t, Comp: COMPONENTS[t.id] }));

export function MethodsTools() {
  const [active, setActive] = useState<number | null>(null);
  const T = active !== null ? TOOLS[active] : null;
  return (
    <section id="tools" className="container-page scroll-mt-32 pt-10">
      <div className="mb-4">
        <h2 className="t-h2 text-ink">Tools</h2>
        <p className="mt-1 text-[14px] text-ink-muted">{TOOLS.length} free tools · tap one to run it — everything stays on your device</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {TOOLS.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setActive(i)}
            className="group card flex h-full flex-col items-start gap-2 p-3.5 text-left transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-hover)] sm:p-4"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-accent-soft text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
              <Play size={15} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold leading-snug text-ink group-hover:text-accent-2">{t.name}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-ink-muted">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {T && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={() => setActive(null)} role="dialog" aria-modal="true" aria-label={T.name}>
          <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[16px] bg-bg-card p-5 pb-[max(20px,env(safe-area-inset-bottom))] shadow-[var(--shadow-hover)] sm:rounded-[16px]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-[17px] font-bold text-ink">{T.name}</h3>
              <button onClick={() => setActive(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-bg hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <T.Comp />
          </div>
        </div>
      )}
    </section>
  );
}
