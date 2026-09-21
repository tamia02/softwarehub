import { PostHogProvider } from "@/components/analytics/PostHogProvider";

export const dynamic = "force-dynamic";

/** Dashboard shell (reseller + admin): no promo bar or marketing header. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <PostHogProvider />
      {children}
    </div>
  );
}
