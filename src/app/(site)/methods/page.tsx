import { MatrixRain } from "@/components/methods/MatrixRain";
import { MethodsHero } from "@/components/methods/MethodsHero";
import { MethodsList } from "@/components/product/MethodsList";
import { MethodsTools } from "@/components/product/MethodsTools";

export const metadata = { title: "Methods & Tools", description: "Learn the method, then run the tool — a hacker's playbook library that runs in your browser." };

const TOOL_COUNT = 10;

export default function MethodsPage() {
  return (
    <main className="scanlines relative min-h-screen overflow-hidden bg-[#080b0a] text-[#e7f6ef]">
      {/* animated code-rain backdrop */}
      <MatrixRain className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(52,211,153,0.10),transparent)]" />
      <div className="relative z-10">
        <MethodsHero toolCount={TOOL_COUNT} />
        <MethodsList />
        <MethodsTools />
      </div>
    </main>
  );
}
