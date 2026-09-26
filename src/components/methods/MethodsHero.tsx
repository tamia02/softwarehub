"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { methods } from "@/data/methods";

const LINES = [
  "$ ssh guest@softwarehub.lab",
  "> access granted — welcome, builder",
  "$ ./load --methods --tools",
  "> decrypting playbooks ... ok",
  "> mounting 10 browser tools ... ok",
  "> ready.",
];

export function MethodsHero({ toolCount }: { toolCount: number }) {
  const [shown, setShown] = useState<string[]>([]);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(LINES); return; }
    let li = 0, ci = 0;
    const tick = () => {
      if (li >= LINES.length) return;
      const line = LINES[li];
      if (ci <= line.length) { setTyped(line.slice(0, ci)); ci++; timer = setTimeout(tick, 22); }
      else { setShown((s) => [...s, line]); setTyped(""); li++; ci = 0; timer = setTimeout(tick, 180); }
    };
    let timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 pb-10 pt-12 md:grid-cols-[1.05fr_0.95fr] md:pb-16 md:pt-20">
        <div>
          <p className="font-code text-[13px] tracking-[0.25em] text-[#34d399]">root@softwarehub:~$</p>
          <h1 className="glitch mt-4 font-display text-[44px] font-black uppercase leading-[0.92] tracking-[-0.01em] text-[#e7f6ef] md:text-[68px]" data-text="Methods & Tools.">
            Methods
            <br />
            <span className="text-[#34d399]">&amp; Tools.</span>
          </h1>
          <p className="mt-4 max-w-[52ch] font-code text-[14px] leading-relaxed text-[#9fb6ac]">
            {"//"} learn the method, then run the tool. {toolCount} utilities that execute in your browser — nothing ever leaves the tab.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#tools" className="rounded-md border border-[#34d399] bg-[#34d399]/10 px-5 py-2.5 font-code text-[14px] font-bold text-[#34d399] transition-colors hover:bg-[#34d399]/20">./open --tools</Link>
            <Link href="#playbooks" className="rounded-md border border-[#233029] px-5 py-2.5 font-code text-[14px] font-bold text-[#9fb6ac] transition-colors hover:text-white">cat playbooks.md</Link>
          </div>
        </div>

        {/* terminal window */}
        <div className="rounded-[12px] border border-[#1f2a25] bg-[#0b0f0e]/90 shadow-[0_0_40px_rgba(52,211,153,0.08)] backdrop-blur">
          <div className="flex items-center gap-1.5 border-b border-[#1f2a25] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 font-code text-[12px] text-[#7f948b]">bash — softwarehub.lab</span>
          </div>
          <div className="min-h-[220px] p-4 font-code text-[13px] leading-[1.7]">
            {shown.map((l, i) => (
              <p key={i} className={l.startsWith("$") ? "text-[#e7f6ef]" : "text-[#34d399]"}>{l}</p>
            ))}
            {typed && <p className={typed.startsWith("$") ? "text-[#e7f6ef]" : "text-[#34d399]"}>{typed}<span className="cursor-blink">▋</span></p>}
            {shown.length >= LINES.length && <p className="text-[#e7f6ef]">$ <span className="cursor-blink">▋</span></p>}
          </div>
        </div>
      </div>

      {/* stat ticker */}
      <div className="container-page pb-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: String(toolCount), l: "browser tools" },
            { v: String(methods.length), l: "playbooks" },
            { v: "0", l: "data leaves tab" },
            { v: "100%", l: "client-side" },
          ].map((s) => (
            <div key={s.l} className="rounded-[10px] border border-[#1f2a25] bg-[#0e1512] p-4">
              <p className="font-display text-[26px] font-black text-[#34d399]">{s.v}</p>
              <p className="font-code text-[11px] uppercase tracking-wider text-[#7f948b]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
