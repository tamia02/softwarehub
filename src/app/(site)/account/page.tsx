import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ClaimCard } from "@/components/account/ClaimCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { listPasses } from "@/lib/passes.server";

export const metadata = { title: "My Pass" };

export default async function AccountPage() {
  const user = await requireUser();
  const passes = await listPasses(user.id);

  if (!passes.length) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><KeyRound size={22} /></span>
        <h2 className="mt-4 text-xl font-extrabold">No pass yet</h2>
        <p className="mt-2 text-sm text-ink-muted">Redeem an activation code, or buy a pass to unlock every tool for a year.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/account/redeem">Redeem a code</Button>
          <Button href="/home#pricing" variant="secondary">See pricing</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {passes.map((p) => {
        const expired = p.expiresAt < new Date();
        const claimed = p.claims.filter((c) => c.status === "claimed").length;
        return (
          <section key={p.id}>
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold">{p.tierId === "pro" ? "Pro Pass" : "Starter Pass"}</h2>
                  <Badge tone={expired ? "limited" : "success"}>{expired ? "Expired" : "Active"}</Badge>
                  {p.poolId && (
                    <Link href={`/pool/${p.poolId}`} className="text-xs font-semibold text-primary hover:underline">via pool</Link>
                  )}
                </div>
                <p className="text-sm text-ink-muted">
                  {claimed}/{p.claims.length} tools claimed · {expired ? "expired" : "expires"} {p.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {p.claims.map((c) => (
                <ClaimCard key={c.id} expired={expired} claim={{ id: c.id, status: c.status, toolName: c.toolName, vendorName: c.vendorName, offerTitle: c.offerTitle, hue: c.hue, vendorRef: c.vendorRef, issueNote: c.issueNote }} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
