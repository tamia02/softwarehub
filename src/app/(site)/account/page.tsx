import Link from "next/link";
import { PackageOpen, Send, Wallet } from "lucide-react";
import { TelegramLogin } from "@/components/auth/TelegramLogin";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { getLuciferAccount, luciferBotUrl, luciferBotUsername, type LuciferOrder } from "@/lib/lucifer.server";
import { formatINRPrecise } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "My account" };

const STATUS: Record<string, { label: string; tone: string }> = {
  paid: { label: "Paid · delivering", tone: "bg-amber-50 text-amber-700" },
  completed: { label: "Delivered", tone: "bg-emerald-50 text-emerald-700" },
  awaiting_payment: { label: "Awaiting payment", tone: "bg-bg-soft text-ink-muted" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-700" },
};

const when = (s: number) =>
  s ? new Date(s * 1000).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "";

/** Wallet + order history from the Lucifer bot, keyed by the user's Telegram id. */
export default async function AccountPage() {
  const user = await requireUser(undefined, "/account");

  if (!user.telegramId) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[12px] bg-[#229ED9]/10 text-[#229ED9]"><Send size={22} /></span>
        <h2 className="mt-4 text-xl font-extrabold">Connect your Telegram</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-muted">Your wallet and orders live in the Lucifer bot. Connect the Telegram account you use with @{luciferBotUsername} to see them here and buy with your wallet.</p>
        <div className="mt-6">
          <TelegramLogin botUsername={luciferBotUsername} next="/account" />
        </div>
      </div>
    );
  }

  const account = await getLuciferAccount(user.telegramId).catch(() => null);

  if (!account) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-extrabold">Wallet is unavailable right now</h2>
        <p className="mt-2 text-sm text-ink-muted">We couldn&apos;t reach the store. Your balance and orders are safe — please try again shortly, or check them in the bot.</p>
        <div className="mt-6 flex justify-center">
          <Button href={luciferBotUrl} variant="secondary">Open @{luciferBotUsername}</Button>
        </div>
      </div>
    );
  }

  const spent = account.orders.filter((o) => o.status === "paid" || o.status === "completed").reduce((n, o) => n + o.totalPaise, 0);

  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <section className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-primary p-6 text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_90%_at_100%_0%,rgba(239,65,54,0.35),transparent_60%)]" />
          <p className="relative flex items-center gap-2 text-[13px] text-white/60"><Wallet size={15} /> Lucifer wallet</p>
          <p className="relative mt-2 font-display text-[36px] font-extrabold leading-none">{formatINRPrecise(account.balancePaise)}</p>
          <p className="relative mt-2 text-[12.5px] text-white/50">Shared with @{luciferBotUsername}</p>
          <a href={luciferBotUrl} target="_blank" rel="noreferrer" className="relative mt-5 flex h-11 items-center justify-center gap-2 rounded-[8px] bg-accent text-[14px] font-semibold hover:bg-accent-2">
            <Wallet size={16} /> Top up in the bot
          </a>
          <p className="relative mt-2 text-center text-[11.5px] text-white/45">UPI autopay or crypto · balance updates here instantly</p>
        </section>

        <section className="card grid grid-cols-2 divide-x divide-line p-0">
          <div className="p-4">
            <p className="text-[12px] text-ink-faint">Orders</p>
            <p className="mt-1 font-display text-[20px] font-extrabold text-ink">{account.orders.length}</p>
          </div>
          <div className="p-4">
            <p className="text-[12px] text-ink-faint">Total spent</p>
            <p className="mt-1 font-display text-[20px] font-extrabold text-ink">{formatINRPrecise(spent)}</p>
          </div>
        </section>
      </div>

      <section className="card p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-[16px] font-bold text-ink">Order history</h2>
          <Link href="/market#products" className="text-[13px] font-semibold text-accent-2 hover:underline">Shop products</Link>
        </div>
        {account.orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <PackageOpen size={24} className="text-ink-faint" />
            <p className="text-[15px] font-semibold text-ink">No orders yet</p>
            <p className="text-[13px] text-ink-muted">Orders from the website and the bot both show up here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {account.orders.map((o) => (
              <OrderRow key={o.orderId} o={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function OrderRow({ o }: { o: LuciferOrder }) {
  const s = STATUS[o.status] ?? { label: o.status, tone: "bg-bg-soft text-ink-muted" };
  return (
    <li className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate text-[14.5px] font-semibold text-ink">
          {o.name} {o.qty > 1 && <span className="text-ink-faint">× {o.qty}</span>}
        </p>
        <p className="mt-0.5 text-[12px] text-ink-faint">
          <span className="font-code">{o.orderId}</span> · {when(o.createdAt)}
          {o.paidVia.startsWith("web") ? " · website" : o.paidVia ? " · bot" : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={cn("rounded-[6px] px-2 py-1 text-[11.5px] font-semibold", s.tone)}>{s.label}</span>
        <span className="w-24 text-right font-display text-[15px] font-bold text-ink">{formatINRPrecise(o.totalPaise)}</span>
      </div>
    </li>
  );
}
