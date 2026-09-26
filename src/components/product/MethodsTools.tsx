"use client";

import { useState } from "react";
import { X } from "lucide-react";

/* ---------- individual tools (all run in the browser) ---------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-code text-[12px] uppercase tracking-wider text-[#7f948b]">{label}</span>
      {children}
    </label>
  );
}
const ta = "w-full rounded-lg border border-[#1f2a25] bg-[#0e1512] p-3 font-code text-[13px] text-[#e7f6ef] focus:border-[#34d399] focus:outline-none";
const out = "mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[#1f2a25] bg-[#0b0f0e] p-3 font-code text-[13px] text-[#34d399]";

function Base64Tool() {
  const [t, setT] = useState("");
  let enc = "", dec = "";
  try { enc = t ? btoa(unescape(encodeURIComponent(t))) : ""; } catch { enc = "(can't encode)"; }
  try { dec = t ? decodeURIComponent(escape(atob(t.trim()))) : ""; } catch { dec = "(not valid Base64)"; }
  return (<div><Field label="Text or Base64"><textarea className={ta} rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="Type text to encode, or paste Base64 to decode" /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">Encoded →</p><div className={out}>{enc || "…"}</div><p className="mt-3 font-code text-[12px] text-[#7f948b]">Decoded →</p><div className={out}>{dec || "…"}</div></div>);
}

function JwtTool() {
  const [t, setT] = useState("");
  const parse = (seg?: string) => { try { return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob((seg ?? "").replace(/-/g, "+").replace(/_/g, "/"))))), null, 2); } catch { return "(invalid)"; } };
  const [h, p] = t.split(".");
  return (<div><Field label="JWT"><textarea className={ta} rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="eyJhbGciOi..." /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">Header →</p><div className={out}>{t ? parse(h) : "…"}</div><p className="mt-3 font-code text-[12px] text-[#7f948b]">Payload →</p><div className={out}>{t ? parse(p) : "…"}</div></div>);
}

function HashTool() {
  const [t, setT] = useState(""); const [h, setH] = useState("");
  async function run() { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); setH([...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")); }
  return (<div><Field label="Text"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} onKeyUp={run} placeholder="Anything" /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">SHA-256 →</p><div className={out}>{h || "…"}</div></div>);
}

function JsonTool() {
  const [t, setT] = useState(""); let res = "";
  try { res = t ? JSON.stringify(JSON.parse(t), null, 2) : ""; } catch (e) { res = `✗ ${e instanceof Error ? e.message : "invalid JSON"}`; }
  return (<div><Field label="JSON"><textarea className={ta} rows={5} value={t} onChange={(e) => setT(e.target.value)} placeholder='{"a":1}' /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">Formatted →</p><div className={out}>{res || "…"}</div></div>);
}

function UrlTool() {
  const [t, setT] = useState("");
  let enc = "", dec = "";
  try { enc = t ? encodeURIComponent(t) : ""; } catch {}
  try { dec = t ? decodeURIComponent(t) : ""; } catch { dec = "(invalid)"; }
  return (<div><Field label="Text or URL"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">Encoded →</p><div className={out}>{enc || "…"}</div><p className="mt-3 font-code text-[12px] text-[#7f948b]">Decoded →</p><div className={out}>{dec || "…"}</div></div>);
}

function UuidTool() {
  const [ids, setIds] = useState<string[]>([]);
  return (<div><button onClick={() => setIds(Array.from({ length: 5 }, () => crypto.randomUUID()))} className="rounded-full border-2 border-[#233029] bg-[#0e1512] px-4 py-2 text-[13px] font-bold text-[#34d399]">Generate 5 UUIDs</button><div className={out}>{ids.length ? ids.join("\n") : "…"}</div></div>);
}

function PasswordTool() {
  const [len, setLen] = useState(16); const [pw, setPw] = useState("");
  function gen() { const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*"; const a = crypto.getRandomValues(new Uint32Array(len)); setPw([...a].map((n) => c[n % c.length]).join("")); }
  return (<div><Field label={`Length: ${len}`}><input type="range" min={8} max={40} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-[#34d399]" /></Field><button onClick={gen} className="mt-2 rounded-full border-2 border-[#233029] bg-[#0e1512] px-4 py-2 text-[13px] font-bold text-[#34d399]">Generate</button><div className={`${out} select-all`}>{pw || "…"}</div></div>);
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
  return (<div><Field label="Text or hex"><textarea className={ta} rows={3} value={t} onChange={(e) => setT(e.target.value)} /></Field><p className="mt-3 font-code text-[12px] text-[#7f948b]">Text → Hex</p><div className={out}>{toHex || "…"}</div><p className="mt-3 font-code text-[12px] text-[#7f948b]">Hex → Text</p><div className={out}>{fromHex || "…"}</div></div>);
}

function TimestampTool() {
  const [t, setT] = useState(String(Math.floor(Date.now() / 1000)));
  const n = Number(t); const d = n ? new Date(n > 1e12 ? n : n * 1000) : null;
  return (<div><Field label="Unix timestamp"><input className={ta} value={t} onChange={(e) => setT(e.target.value)} /></Field><div className={out}>{d && !isNaN(d.getTime()) ? `UTC:   ${d.toUTCString()}\nLocal: ${d.toString()}` : "…"}</div><button onClick={() => setT(String(Math.floor(Date.now() / 1000)))} className="mt-3 rounded-full border-2 border-[#233029] bg-[#0e1512] px-4 py-2 text-[13px] font-bold text-[#34d399]">Now</button></div>);
}

const TOOLS: { name: string; desc: string; Comp: () => React.JSX.Element }[] = [
  { name: "Base64 Encoder / Decoder", desc: "Text ⇄ Base64", Comp: Base64Tool },
  { name: "JWT Reader", desc: "Decode a token's header & payload", Comp: JwtTool },
  { name: "SHA-256 Hash", desc: "Hash any text", Comp: HashTool },
  { name: "JSON Formatter", desc: "Beautify & validate JSON", Comp: JsonTool },
  { name: "URL Encoder / Decoder", desc: "Percent-encode text", Comp: UrlTool },
  { name: "UUID Generator", desc: "Secure random v4 IDs", Comp: UuidTool },
  { name: "Password Generator", desc: "Strong random passwords", Comp: PasswordTool },
  { name: "Case Converter", desc: "UPPER / kebab / snake / Title", Comp: CaseTool },
  { name: "Hex ⇄ Text", desc: "Convert text to hex and back", Comp: HexTool },
  { name: "Unix Timestamp", desc: "Epoch ⇄ readable date", Comp: TimestampTool },
];

export function MethodsTools() {
  const [active, setActive] = useState<number | null>(null);
  const T = active !== null ? TOOLS[active] : null;
  return (
    <section id="tools" className="scroll-mt-24 border-t border-[#1f2a25] bg-[#0b0f0e] py-12 md:py-16">
      <div className="container-page">
        <h2 className="font-hack text-[30px] font-normal uppercase tracking-[0.02em] text-[#f2fbf6] text-neon md:text-[40px]">{"> "}The toolkit</h2>
        <p className="mt-2 font-hack text-[13px] text-[#9fb6ac]">{TOOLS.length} working tools · click any to run it — everything stays in your browser</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => (
            <button key={t.name} onClick={() => setActive(i)} className="group flex items-start justify-between gap-3 rounded-[14px] border border-[#1f2a25] bg-[#111815] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#34d399]/60 hover:shadow-[0_0_18px_rgba(52,211,153,0.12)]">
              <div><p className="font-hack text-[15px] font-normal text-[#e7f6ef] transition-colors group-hover:text-[#34d399]">{t.name}</p><p className="mt-0.5 text-[12px] leading-snug text-[#9fb6ac]">{t.desc}</p></div>
              <span className="shrink-0 rounded-full bg-[#123024] px-2 py-0.5 font-hack text-[10px] font-bold text-[#34d399] transition-transform group-hover:scale-110">Run</span>
            </button>
          ))}
        </div>
      </div>

      {T && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-lg rounded-t-[20px] border border-[#1f2a25] bg-[#0e1512] p-5 sm:rounded-[20px]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-black text-[#f2fbf6]">{T.name}</h3>
              <button onClick={() => setActive(null)} className="grid h-8 w-8 place-items-center rounded-full border border-[#1f2a25] text-[#9fb6ac] hover:text-white"><X size={16} /></button>
            </div>
            <T.Comp />
          </div>
        </div>
      )}
    </section>
  );
}
