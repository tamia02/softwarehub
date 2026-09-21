import { Mail } from "lucide-react";
import { site } from "@/config/site";
import { getSettings } from "@/lib/settings.server";

export const metadata = { title: "Contact" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const s = await getSettings();
  const subject = topic === "teams" ? `Team pricing (${s.teamDiscountPct}% off for 5+ seats)` : "Software Hub Pool enquiry";
  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Mail size={22} /></span>
        <h1 className="mt-4 text-2xl font-extrabold">{topic === "teams" ? "Buying for a team?" : "Talk to us"}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {topic === "teams" ? `Save ${s.teamDiscountPct}% per seat on ${5}+ seats. Tell us how many seats and which pass, and we will send a GST quote within one business day.` : "Reseller enquiries, vendor partnerships, or anything else — a human replies within one business day."}
        </p>
        <a href={`mailto:${site.supportEmail}?subject=${encodeURIComponent(subject)}`} className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-white hover:bg-primary-600">
          Email {site.supportEmail}
        </a>
      </div>
    </div>
  );
}
