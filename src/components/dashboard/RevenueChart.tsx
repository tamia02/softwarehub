"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RevenueChart({ data }: { data: Array<{ label: string; revenuePaise: number; pools: number }> }) {
  const rows = data.map((d) => ({ ...d, revenue: d.revenuePaise / 100 }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} />
          <Tooltip
            formatter={(v) => [`₹${Number(v ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--line)", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="revenue" stroke="var(--brand-primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
