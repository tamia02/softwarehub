import { redirect } from "next/navigation";
import { OtpForm } from "@/components/auth/OtpForm";
import { DemoLogin } from "@/components/auth/DemoLogin";
import { TelegramLogin } from "@/components/auth/TelegramLogin";
import { Logo } from "@/components/brand/Logo";
import { demoLoginAllowed, getSessionUser } from "@/lib/auth.server";
import { googleConfigured } from "@/lib/google-auth.server";
import { luciferBotUsername } from "@/lib/lucifer.server";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  rate: "Too many attempts. Try again in a few minutes.",
  telegram: "Telegram sign-in could not be verified. Please try again.",
  google: "Google sign-in didn't complete. Please try again.",
  "google-off": "Google sign-in isn't available right now. Use Telegram or an email code.",
};

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[11.5px] font-semibold uppercase tracking-wider text-ink-faint">
      <span className="h-px flex-1 bg-line-strong" />
      {label}
      <span className="h-px flex-1 bg-line-strong" />
    </div>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; identifier?: string; error?: string }> }) {
  const { next, identifier, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : undefined;
  const user = await getSessionUser();
  if (user) redirect(safeNext ?? (user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account"));
  const demo = demoLoginAllowed();
  const google = googleConfigured();

  return (
    <div className="container-page flex min-h-[70vh] items-start justify-center py-6 sm:items-center sm:py-12">
      <div className="card w-full min-w-0 max-w-md p-5 sm:p-8">
        <Logo size={40} />
        <h1 className="mt-4 text-[24px] font-black leading-tight sm:text-[26px]">Sign in or create an account</h1>
        <p className="mt-1 text-[14px] text-ink-muted">One account for the website and the Lucifer bot — your wallet and orders follow you.</p>

        {error && (
          <p role="alert" className="mt-4 rounded-[8px] bg-rose-50 px-3 py-2 text-[13px] text-rose-700">
            {ERRORS[error] ?? ERRORS.telegram}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {google && (
            <a
              href={`/api/auth/google${safeNext ? `?next=${encodeURIComponent(safeNext)}` : ""}`}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-line-strong bg-bg-card text-[15px] font-semibold text-ink transition-colors hover:bg-bg"
            >
              <GoogleMark /> Continue with Google
            </a>
          )}

          <div className="rounded-[12px] border border-line bg-bg p-4">
            <p className="mb-3 text-center text-[13px] font-semibold text-ink">Log in with Telegram</p>
            <TelegramLogin botUsername={luciferBotUsername} next={safeNext} />
            <p className="mt-3 text-center text-[12px] text-ink-faint">Wallet, top-ups and orders are shared with @{luciferBotUsername}.</p>
          </div>
        </div>

        {demo && (
          <>
            <Divider label="or try the demo" />
            <DemoLogin next={safeNext} />
          </>
        )}

        <Divider label="or get a code by email" />
        <OtpForm next={safeNext} initialIdentifier={identifier?.slice(0, 120) ?? ""} />
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
