import { redirect } from "next/navigation";
import { OtpForm } from "@/components/auth/OtpForm";
import { DemoLogin } from "@/components/auth/DemoLogin";
import { TelegramLogin } from "@/components/auth/TelegramLogin";
import { Logo } from "@/components/brand/Logo";
import { demoLoginAllowed, getSessionUser } from "@/lib/auth.server";
import { luciferBotUsername } from "@/lib/lucifer.server";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; identifier?: string; error?: string }> }) {
  const { next, identifier, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const user = await getSessionUser();
  if (user) redirect(safeNext ?? (user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account"));
  const demo = demoLoginAllowed();

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <Logo size={40} />
        <h1 className="mt-4 text-[26px] font-black leading-tight">Sign in or create an account</h1>
        <p className="mt-1 text-sm text-ink-muted">Use your Telegram — the same account as the Lucifer bot, with your wallet and orders.</p>

        {error && (
          <p role="alert" className="mt-4 rounded-[8px] bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {error === "rate" ? "Too many attempts. Try again in a few minutes." : "Telegram sign-in could not be verified. Please try again."}
          </p>
        )}

        <div className="mt-6 rounded-[12px] border border-line bg-bg p-4">
          <p className="mb-3 text-center text-[13px] font-semibold text-ink">Log in with Telegram</p>
          <TelegramLogin botUsername={luciferBotUsername} next={safeNext} />
          <p className="mt-3 text-center text-[12px] text-ink-faint">Wallet, top-ups and orders are shared with @{luciferBotUsername}.</p>
        </div>

        <div className="my-6 flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
          <span className="h-px flex-1 bg-line-strong" />
          or
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        {demo && (
          <div>
            <DemoLogin next={safeNext} />
            <div className="my-6 flex items-center gap-3 text-[12px] font-bold uppercase tracking-wider text-ink-faint">
              <span className="h-px flex-1 bg-line-strong" />
              or use a code
              <span className="h-px flex-1 bg-line-strong" />
            </div>
          </div>
        )}

        <div>
          <OtpForm next={safeNext} initialIdentifier={identifier?.slice(0, 120) ?? ""} />
        </div>
      </div>
    </div>
  );
}
