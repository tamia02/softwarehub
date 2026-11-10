"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function AdminAccessForm({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <form className="mt-5 space-y-3" onSubmit={async (event) => {
      event.preventDefault();
      const adminKey = new FormData(event.currentTarget).get("adminKey");
      setPending(true);
      setError("");
      try {
        const response = await fetch("/api/auth/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "admin", adminKey }),
        });
        if (response.ok) {
          window.location.assign(next);
        } else {
          const result = await response.json();
          setError(result.error ?? "Admin sign-in failed.");
        }
      } catch {
        setError("Could not connect. Please try again.");
      } finally {
        setPending(false);
      }
    }}>
      <label className="block text-sm font-semibold">
        Private access key
        <input type="password" name="adminKey" autoComplete="current-password" maxLength={128} required
          className="mt-1 w-full rounded-lg border border-line bg-bg-soft px-3 py-2 focus:border-primary focus:outline-none" />
      </label>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in as admin"}</Button>
    </form>
  );
}
