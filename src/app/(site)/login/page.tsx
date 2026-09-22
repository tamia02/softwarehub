import { redirect } from "next/navigation";
import { OtpForm } from "@/components/auth/OtpForm";
import { DemoLogin } from "@/components/auth/DemoLogin";
import { Logo } from "@/components/brand/Logo";
import { demoLoginAllowed, getSessionUser } from "@/lib/auth.server";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; identifier?: string }> }) {
  const { next, identifier } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const user = await getSessionUser();
  if (user) redirect(safeNext ?? (user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account"));
  const demo = demoLoginAllowed();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <Logo size={40} />
        <h1 className="mt-4 text-[26px] font-black leading-tight">Sign in or create an account</h1>
        <p className="mt-1 text-sm text-ink-muted">One-time code by email or SMS. Indian mobile numbers welcome.</p>

        {demo && (
          <div className="mt-6">
            <DemoLogin next={safeNext} />
            <div className="my-6 flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
              <span className="h-px flex-1 bg-line-strong" />
              or use a code
              <span className="h-px flex-1 bg-line-strong" />
            </div>
          </div>
        )}

        <div className={demo ? "" : "mt-6"}>
          <OtpForm next={safeNext} initialIdentifier={identifier?.slice(0, 120) ?? ""} />
        </div>
      </div>
    </div>
  );
}
