"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { track } from "@/components/analytics/track";

/** Pill email/phone capture → OTP sign-in → Pro Pass checkout. */
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
    <form onSubmit={submit} className="flex h-16 w-full max-w-md items-center rounded-full border-2 border-line-strong bg-white p-1.5 pl-6 shadow-[var(--shadow-card)] focus-within:border-primary/60 focus-within:ring-4 focus-within:ring-accent/30">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="your@email.com or mobile"
        autoComplete="email"
        aria-label="Email or mobile number"
        className="min-w-0 flex-1 bg-transparent font-display text-[17px] font-medium text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button type="submit" aria-label="Continue" className="grid h-12 w-14 shrink-0 place-items-center rounded-full bg-primary text-[#fff8e8] shadow-[var(--shadow-button)] transition-transform hover:-translate-y-0.5 active:scale-95">
        <ArrowRight size={22} strokeWidth={2.5} />
      </button>
    </form>
  );
}
