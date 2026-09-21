import { Panel } from "@/components/dashboard/Shell";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { tierRows } from "@/lib/admin.server";
import { getSettings } from "@/lib/settings.server";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const [s, tiers] = await Promise.all([getSettings(), tierRows()]);
  const t = (id: string) => tiers.find((x) => x.id === id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Settings</h1>
      <Panel>
        <SettingsForm settings={s as unknown as Record<string, string | number>} tiers={{ starter: t("starter")?.pricePaise ?? 0, pro: t("pro")?.pricePaise ?? 0, starterReseller: t("starter")?.resellerPricePaise ?? 0, proReseller: t("pro")?.resellerPricePaise ?? 0 }} />
      </Panel>
    </div>
  );
}
