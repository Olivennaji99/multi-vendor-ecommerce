"use client";

import { useEffect, useState } from "react";

function getRemaining(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function FlashSaleCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAt));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(endsAt)), 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-1 font-mono text-sm font-semibold text-brand-red">
      <span className="rounded bg-brand-red/10 px-1.5 py-0.5">{pad(remaining.hours)}</span>:
      <span className="rounded bg-brand-red/10 px-1.5 py-0.5">{pad(remaining.minutes)}</span>:
      <span className="rounded bg-brand-red/10 px-1.5 py-0.5">{pad(remaining.seconds)}</span>
    </div>
  );
}
