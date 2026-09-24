"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { PayButton } from "@/components/checkout/PayButton";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";

export function JoinPool({ poolId, seatPricePaise, open, alreadyIn, signedIn, single }: { poolId: string; seatPricePaise: number; open: boolean; alreadyIn: boolean; signedIn: boolean; single: boolean }) {
  if (alreadyIn) {
    return (
      <div className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-50 font-bold text-emerald-700">
        <Check size={18} /> Your seat is confirmed
      </div>
    );
  }
  if (!open) {
    return <div className="flex h-14 flex-1 items-center justify-center rounded-full bg-bg-soft font-bold text-ink-muted">This pool is closed</div>;
  }
  if (!signedIn) {
    return (
      <Button href={`/login?next=${encodeURIComponent(`/pool/${poolId}`)}`} size="lg" className="flex-1">
        Sign in to join for {formatINR(seatPricePaise)}
      </Button>
    );
  }
  return (
    <PayButton
      className="flex-1"
      createUrl={`/api/pools/${poolId}/join`}
      label={single ? "Reserve my seat" : `Join for ${formatINR(seatPricePaise)}`}
      successHref="/checkout/success?order={orderId}"
      reservedHref={`/pool/${poolId}`}
      event="pool_join_started"
    />
  );
}

export function ShareLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Join my Software Hub", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <Button onClick={share} variant="secondary" size="lg">
      {copied ? <Copy size={16} /> : <Share2 size={16} />} {copied ? "Link copied" : "Share link"}
    </Button>
  );
}
