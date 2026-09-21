import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";

/** Placeholder for routes scheduled in a later build phase (§12). */
export function PhaseStub({ title, phase, children }: { title: string; phase: number; children?: React.ReactNode }) {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-line bg-bg-soft p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary shadow-sm">
          <Construction size={22} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">{title}</h1>
        <p className="mt-2 text-sm text-ink-muted">This screen ships in build phase {phase}.</p>
        {children && <div className="mt-6 text-left">{children}</div>}
        <Link href="/home" className="mt-8 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
