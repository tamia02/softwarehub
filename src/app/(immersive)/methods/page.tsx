import Link from "next/link";
import { MatrixRain } from "@/components/methods/MatrixRain";
import { MethodsHero } from "@/components/methods/MethodsHero";
import { MethodsList } from "@/components/product/MethodsList";
import { MethodsTools } from "@/components/product/MethodsTools";

export const metadata = { title: "Methods & Tools", description: "Learn the method, then run the tool — a hacker's playbook library that runs in your browser." };

const TOOL_COUNT = 10;

export default function MethodsPage() {
  return (
    <main className="scanlines relative min-h-dvh overflow-hidden bg-[#070a09] font-term text-[#c7d6cf]">
      {/* layered backdrop: subtle grid + code-rain + top glow */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <MatrixRain className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.28]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_45%_at_50%_0%,rgba(52,211,153,0.10),transparent)]" />

      {/* terminal status line — not a nav header; a thin HUD strip */}
      <div className="relative z-20 border-b border-[#132019] bg-[#070a09]/85 backdrop-blur">
        <div className="container-page flex h-9 items-center justify-between font-term text-[12px] text-[#5f746b]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            <span className="text-[#34d399]">softwarehub.lab</span>
            <span className="hidden sm:inline">— secure shell // 100% client-side</span>
          </div>
          <Link href="/market" className="group inline-flex items-center gap-2 transition-colors hover:text-[#34d399]">
            <span className="text-[#3f5249] group-hover:text-[#34d399]">$</span> exit ↩ marketplace
          </Link>
        </div>
      </div>

      <div className="relative z-10">
        <MethodsHero toolCount={TOOL_COUNT} />
        <MethodsTools />
        <MethodsList />
      </div>

      {/* terminal footer — minimal, anonymous */}
      <footer className="relative z-10 border-t border-[#132019] bg-[#070a09]/85 py-7">
        <div className="container-page flex flex-col items-center gap-2 text-center font-term text-[11px] text-[#5f746b]">
          <pre className="text-[#233029] leading-[1.15]">{`  ┌─[ softwarehub.lab ]─[ ~/methods ]
  └──$ _`}</pre>
          <p>{"// no logins · no tracking · nothing ever leaves this tab"}</p>
          <Link href="/market" className="text-[#7f948b] transition-colors hover:text-[#34d399]">$ cd /marketplace</Link>
        </div>
      </footer>
    </main>
  );
}
