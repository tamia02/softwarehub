import { ClipboardPaste, MousePointerClick, Rocket } from "lucide-react";
import { smmCatalog, smmPlatforms, smmStats } from "@/data/smm";

/** simple-icons slug per platform. */
const ICON: Record<string, string> = {
  Instagram: "instagram",
  YouTube: "youtube",
  TikTok: "tiktok",
  Telegram: "telegram",
  Facebook: "facebook",
  "Twitter / X": "x",
  Spotify: "spotify",
  "Website Traffic": "googlechrome",
};

const steps = [
  { icon: MousePointerClick, title: "Pick a service", body: "Followers, likes, views or watch-time" },
  { icon: ClipboardPaste, title: "Paste your link", body: "Profile, post or video URL" },
  { icon: Rocket, title: "Watch it grow", body: "Starts automatically, tracked live" },
];

/**
 * Grow hero card: real catalogue counts per platform plus the three ordering
 * steps. (Replaces a decorative "live dispatch" counter whose numbers weren't real.)
 */
export function GrowthHeroVisual() {
  const perPlatform = new Map<string, number>();
  for (const c of smmCatalog) perPlatform.set(c.platform, (perPlatform.get(c.platform) ?? 0) + c.services.length);

  return (
    <div className="anim-fade-scale rounded-[var(--r-card-lg)] border border-ink-line bg-bg-card p-5 shadow-[var(--shadow-card)] sm:p-6" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-bold text-ink">Platforms we grow</p>
        <span className="rounded-[6px] bg-accent-soft px-2 py-1 text-[12px] font-semibold text-accent-2">{smmStats.services}+ services</span>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {smmPlatforms.map((p) => (
          <li key={p} className="flex items-center gap-2 rounded-[10px] border border-line bg-bg px-2.5 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://cdn.simpleicons.org/${ICON[p] ?? "googlechrome"}`} alt="" width={18} height={18} className="shrink-0 object-contain" loading="lazy" />
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold text-ink">{p}</span>
              <span className="block text-[11px] text-ink-faint">{perPlatform.get(p) ?? 0} services</span>
            </span>
          </li>
        ))}
      </ul>

      <ol className="mt-5 grid grid-cols-1 gap-2 border-t border-line pt-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-2.5 sm:flex-col sm:gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-primary text-white">
              <s.icon size={15} />
            </span>
            <span>
              <span className="block text-[13px] font-semibold text-ink">{i + 1}. {s.title}</span>
              <span className="block text-[12px] text-ink-faint">{s.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
