import { redirect } from "next/navigation";
import { OtpForm } from "@/components/auth/OtpForm";
import { Logo } from "@/components/brand/Logo";
import { getSessionUser } from "@/lib/auth.server";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; identifier?: string }> }) {
  const { next, identifier } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const user = await getSessionUser();
  if (user) redirect(safeNext ?? (user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account"));

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <Logo size={40} />
        <h1 className="mt-4 text-[26px] font-black leading-tight">Sign in or create an account</h1>
        <p className="mt-1 text-sm text-ink-muted">One-time code by email or SMS. Indian mobile numbers welcome.</p>
        <div className="mt-6">
          <OtpForm next={safeNext} initialIdentifier={identifier?.slice(0, 120) ?? ""} />
        </div>
      </div>
    </div>
  );
}
