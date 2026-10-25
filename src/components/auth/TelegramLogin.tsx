"use client";

import { useEffect, useRef } from "react";

/**
 * Official Telegram Login Widget in redirect mode: after the user approves in
 * Telegram, the browser is sent to /api/auth/telegram with signed fields.
 * Requires the bot's domain to be set in @BotFather (/setdomain).
 */
export function TelegramLogin({ botUsername, next }: { botUsername: string; next?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const auth = new URL("/api/auth/telegram", window.location.origin);
    if (next) auth.searchParams.set("next", next);
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", botUsername);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "8");
    s.setAttribute("data-auth-url", auth.toString());
    s.setAttribute("data-request-access", "write");
    host.replaceChildren(s);
    return () => host.replaceChildren();
  }, [botUsername, next]);

  return <div ref={ref} className="flex min-h-[44px] justify-center" />;
}
