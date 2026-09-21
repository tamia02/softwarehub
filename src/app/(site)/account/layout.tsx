import { AccountNav } from "@/components/account/AccountNav";
import { requireUser } from "@/lib/auth.server";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(undefined, "/account");
  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">My Pass</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight">{user.name ? `Hi, ${user.name.split(" ")[0]}` : "Your account"}</h1>
          <p className="text-sm text-ink-muted">{user.email ?? user.phone}</p>
        </div>
        <AccountNav role={user.role} />
      </div>
      <div className="mt-8">{children}</div>
    </div>
  );
}
