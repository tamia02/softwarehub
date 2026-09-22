"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { track } from "@/components/analytics/track";

/**
 * Email/mobile capture pill (measured: 68px tall, 36px radius, 2px outline,
 * 20–26px bold input, 60×44 arrow button with offset layer) → OTP → checkout.
 */
export function HeroEmailForm({ next = "/checkout/direct?tier=pro" }: { next?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (value.trim().length < 3) return;
    track("hero_capture", { channel: value.includes("@") ? "email" : "phone" });
    router.push(`/login?identifier=${encodeURIComponent(value.trim())}&next=${encodeURIComponent(next)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-[60px] w-full max-w-[520px] items-center gap-2 overflow-hidden rounded-[36px] border-2 border-ink-line bg-bg-card py-[6px] pl-[18px] pr-[6px] transition-shadow focus-within:ring-4 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg md:h-[68px] md:pl-[22px] md:pr-[8px]"
    >
      <label htmlFor="hero-identifier" className="sr-only">
        Email or mobile number
      </label>
      <input
        id="hero-identifier"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="your@email.com"
        autoComplete="email"
        className="block h-full min-w-0 flex-1 bg-transparent text-[20px] font-bold leading-[1.2] text-ink caret-ink-line outline-none placeholder:text-ink-faint md:text-[24px]"
      />
      <button type="submit" aria-label="Get started" className="group relative inline-flex h-[44px] w-[60px] shrink-0 rounded-[100px]">
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[100px] border-2 border-ink-line bg-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
        <span className="relative z-10 inline-flex h-full w-full items-center justify-center rounded-[100px] border-2 border-ink-line bg-accent text-on-accent transition-transform duration-150 ease-out group-hover:-translate-y-[5px]">
          <ArrowRight size={22} strokeWidth={2.5} />
        </span>
      </button>
    </form>
  );
}
