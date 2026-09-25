import { requireUser } from "@/lib/auth.server";
import { getBalance } from "@/lib/wallet.server";
import { listSmmOrders } from "@/lib/smm.server";
import { listApiKeys } from "@/lib/apikeys.server";
import { smmCatalog } from "@/data/smm";
import { SmmPanel } from "@/components/smm/SmmPanel";

export const metadata = { title: "Growth panel" };
export const dynamic = "force-dynamic";

export default async function GrowthPanelPage() {
  const user = await requireUser();
  const [balancePaise, orders, keys] = await Promise.all([getBalance(user.id), listSmmOrders(user.id, 50), listApiKeys(user.id)]);
  const services = smmCatalog.map((c) => ({
    label: `${c.platform} · ${c.category}`,
    options: c.services.map((s) => ({ id: s.id, name: s.name, rate: s.ratePer1k, min: s.min, max: s.max })),
  }));
  const orderData = orders.map((o) => ({
    id: o.id, service: o.serviceName, link: o.link, quantity: o.quantity, chargePaise: o.chargePaise,
    remains: o.remains, status: o.status, createdAt: o.createdAt.toISOString(),
  }));
  return <SmmPanel balancePaise={balancePaise} services={services} orders={orderData} apiKeys={keys.map((k) => ({ id: k.id, last4: k.last4, lastUsedAt: k.lastUsedAt?.toISOString() ?? null }))} />;
}
