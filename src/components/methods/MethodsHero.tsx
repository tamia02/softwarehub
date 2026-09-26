"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Terminal } from "lucide-react";
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
      <div className="container-page grid items-center gap-10 pb-10 pt-10 md:grid-cols-[1.05fr_0.95fr] md:pb-16 md:pt-16">
        <div>
          <div className="flex flex-wrap items-center gap-2 font-hack text-[12px]">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#233029] bg-[#0e1512] px-2 py-1 text-[#34d399]">
              <ShieldCheck size={13} /> ENCRYPTED
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#3a3315] bg-[#161206] px-2 py-1 text-[#f5c542]">
              <Terminal size={13} /> GUEST · anonymous
            </span>
            <span className="tracking-[0.25em] text-[#5f746b]">root@softwarehub:~$</span>
          </div>
          <h1 className="glitch anim-flicker mt-4 font-hack text-[46px] font-normal uppercase leading-[0.9] tracking-[0.01em] text-[#e7f6ef] text-neon md:text-[74px]" data-text="Methods & Tools.">
            Methods
            <br />
            <span className="text-[#34d399]">&amp; Tools.</span>
          </h1>
          <p className="mt-4 max-w-[54ch] font-hack text-[15px] leading-relaxed text-[#9fb6ac]">
            {"//"} learn the method, then run the tool. {toolCount} utilities that execute in your browser — <span className="text-[#f5c542]">nothing ever leaves the tab.</span>
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#tools" className="sheen rounded-md border border-[#34d399] bg-[#34d399]/10 px-5 py-2.5 font-hack text-[14px] font-bold text-[#34d399] transition-colors hover:bg-[#34d399]/20">./open --tools</Link>
            <Link href="#playbooks" className="sheen rounded-md border border-[#233029] px-5 py-2.5 font-hack text-[14px] font-bold text-[#9fb6ac] transition-colors hover:text-white">cat playbooks.md</Link>
          </div>
        </div>

        {/* terminal window */}
        <div className="rounded-[12px] border border-[#1f2a25] bg-[#0b0f0e]/90 shadow-[0_0_40px_rgba(52,211,153,0.08)] backdrop-blur">
          <div className="flex items-center gap-1.5 border-b border-[#1f2a25] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 font-hack text-[12px] text-[#7f948b]">bash — softwarehub.lab</span>
          </div>
          <div className="min-h-[220px] p-4 font-hack text-[13px] leading-[1.7]">
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
            <div key={s.l} className="rounded-[10px] border border-[#1f2a25] bg-[#0e1512] p-4 transition-colors hover:border-[#34d399]/50">
              <p className="font-hack text-[30px] font-normal text-[#34d399] text-neon">{s.v}</p>
              <p className="font-hack text-[11px] uppercase tracking-wider text-[#7f948b]">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
