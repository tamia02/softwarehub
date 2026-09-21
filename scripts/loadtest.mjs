// Load test with autocannon. Usage: node scripts/loadtest.mjs [baseUrl] [seconds] [connections]
import autocannon from "autocannon";

const base = process.argv[2] ?? "http://localhost:3000";
const duration = Number(process.argv[3] ?? 15);
const connections = Number(process.argv[4] ?? 50);

const targets = [
  { name: "GET /home (SSR marketing page)", url: `${base}/home` },
  { name: "GET /api/pricing", url: `${base}/api/pricing` },
  { name: "GET /api/pools", url: `${base}/api/pools` },
  { name: "POST /api/gate/verify (rate-limited path)", url: `${base}/api/gate/verify`, method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: "CUST-DEMO-2026", role: "customer" }) },
];

const rows = [];
for (const t of targets) {
  const r = await autocannon({ url: t.url, method: t.method ?? "GET", headers: t.headers, body: t.body, connections, duration });
  rows.push({
    target: t.name,
    "req/s": Math.round(r.requests.average),
    "p50 ms": r.latency.p50,
    "p99 ms": r.latency.p99,
    "2xx": r["2xx"],
    "non-2xx": r.non2xx,
    errors: r.errors,
  });
}
console.table(rows);
