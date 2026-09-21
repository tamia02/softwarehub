"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { track } from "@/components/analytics/track";

/** Email/mobile capture → OTP sign-in → Pro Pass checkout. */
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
      className="flex h-14 w-full max-w-lg items-center rounded-full border border-line-strong bg-white p-1.5 pl-5 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-accent/25"
    >
      <label htmlFor="hero-identifier" className="sr-only">
        Email or mobile number
      </label>
      <input
        id="hero-identifier"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="you@company.com"
        autoComplete="email"
        className="min-w-0 flex-1 bg-transparent text-[16px] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-[15px] font-semibold text-[#fbf6ec] shadow-[var(--shadow-button)] transition-transform hover:-translate-y-px active:scale-[0.985]"
      >
        Get started <ArrowRight size={16} strokeWidth={2.4} />
      </button>
    </form>
  );
}
