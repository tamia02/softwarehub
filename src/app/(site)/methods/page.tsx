import { ArrowRight, BookOpen, Lock, Terminal, Wrench } from "lucide-react";
import { MethodsList } from "@/components/product/MethodsList";
import { MethodsTools } from "@/components/product/MethodsTools";
import { methodTools } from "@/data/methodTools";
import { Button } from "@/components/ui/Button";
import { methods } from "@/data/methods";

const TOOL_COUNT = methodTools.length;

export const metadata = { title: "Methods & Tools", description: "Step-by-step playbooks plus browser tools to run them — free to read, nothing leaves your device." };

const points = [
  { icon: BookOpen, title: "Step-by-step playbooks", body: "Growth, reselling, automation and security — each guide is a short checklist." },
  { icon: Wrench, title: "Tools that run here", body: "Encoders, hashes, JWT reader, password generator and more — right in your browser." },
  { icon: Lock, title: "Private by design", body: "Tools work on your device. Nothing you paste is sent anywhere." },
];

export default function MethodsPage() {
  return (
    <div className="pb-6">
      {/* Hero */}
      <section className="container-page pt-5 md:pt-6">
        <div className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-primary px-5 py-8 text-on-primary md:px-10 md:py-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(239,65,54,0.32),transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(80,110,255,0.18),transparent_60%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="max-w-[600px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/85 ring-1 ring-inset ring-white/15">
                <Terminal size={13} className="text-accent" /> Methods · free to read
              </span>
              <h1 className="t-h1 mt-4 text-balance text-white">
                Learn the method, then <span className="text-accent">run the tools.</span>
              </h1>
              <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-white/65 md:mt-4 md:text-[16px]">
                Practical playbooks for growing, reselling, automating and staying secure — plus {TOOL_COUNT} free tools that run right in your browser.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3 md:mt-7">
                <Button href="#playbooks" size="lg" className="px-3 text-[14px] sm:px-6 sm:text-[16px]">
                  Playbooks <ArrowRight size={17} />
                </Button>
                <a href="#tools" className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/20 px-3 text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.07] sm:px-5 sm:text-[15px]">
                  <Wrench size={16} /> Open tools
                </a>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-x-10 md:mt-9">
                {[
                  { v: String(methods.length), l: "Playbooks" },
                  { v: String(TOOL_COUNT), l: "Browser tools" },
                  { v: "Free", l: "To read & use" },
                ].map((s) => (
                  <div key={s.l}>
                    <dt className="sr-only">{s.l}</dt>
                    <dd className="font-display text-[17px] font-extrabold leading-none text-white sm:text-[22px]">{s.v}</dd>
                    <dd className="mt-1 text-[11.5px] text-white/50 sm:text-[12.5px]">{s.l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="hidden flex-col gap-2.5 lg:flex">
              {points.map((p) => (
                <li key={p.title} className="flex items-start gap-3 rounded-[12px] bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-accent text-white">
                    <p.icon size={17} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-white">{p.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{p.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Points (phones/tablets — on desktop they sit in the hero) */}
      <section className="container-page pt-4 lg:hidden">
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {points.map((p) => (
            <li key={p.title} className="card flex items-start gap-3 p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent-2">
                <p.icon size={17} />
              </span>
              <span>
                <span className="block text-[14px] font-semibold text-ink">{p.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{p.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <MethodsList />
      <MethodsTools />
    </div>
  );
}
