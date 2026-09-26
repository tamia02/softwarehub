import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { MatrixRain } from "@/components/methods/MatrixRain";
import { MethodsHero } from "@/components/methods/MethodsHero";
import { MethodsList } from "@/components/product/MethodsList";
import { MethodsTools } from "@/components/product/MethodsTools";

export const metadata = { title: "Methods & Tools", description: "Learn the method, then run the tool — a hacker's playbook library that runs in your browser." };

const TOOL_COUNT = 10;

export default function MethodsPage() {
  return (
    <main className="scanlines relative min-h-dvh overflow-hidden bg-[#080b0a] font-hack text-[#e7f6ef]">
      {/* animated code-rain backdrop */}
      <MatrixRain className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(52,211,153,0.10),transparent)]" />

      {/* slim immersive top bar — the site header/footer are intentionally gone */}
      <header className="relative z-20 border-b border-[#16211c] bg-[#080b0a]/80 backdrop-blur">
        <div className="container-page flex h-12 items-center justify-between text-[13px]">
          <Link href="/market" className="group inline-flex items-center gap-2 text-[#7f948b] transition-colors hover:text-[#34d399]">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>cd /marketplace</span>
          </Link>
          <div className="flex items-center gap-2 text-[#34d399]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#34d399] shadow-[0_0_8px_#34d399]" />
            <span className="hidden sm:inline text-[#5f746b]">session</span>
            <span className="inline-flex items-center gap-1 text-[#f5c542]"><Lock size={12} /> anon</span>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <MethodsHero toolCount={TOOL_COUNT} />
        <MethodsTools />
        <MethodsList />
      </div>

      {/* immersive footer line */}
      <footer className="relative z-10 border-t border-[#16211c] py-6">
        <div className="container-page flex flex-col items-center gap-1 text-center font-hack text-[11px] text-[#5f746b]">
          <p>{"// everything runs client-side · nothing leaves this tab"}</p>
          <p className="text-[#3f5249]">softwarehub.lab — <Link href="/market" className="text-[#7f948b] hover:text-[#34d399]">return to marketplace</Link></p>
        </div>
      </footer>
    </main>
  );
}
