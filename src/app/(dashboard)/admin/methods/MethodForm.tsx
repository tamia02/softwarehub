"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { methodCategories, type Method } from "@/data/methods";
import { saveMethod } from "./actions";
import type { ActionResult } from "../../reseller/actions";

const field = "mt-1 w-full rounded-lg border border-line bg-bg-soft px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none";

export function MethodForm({ method }: { method?: Method }) {
  const [result, setResult] = useState<ActionResult>();
  const [pending, start] = useTransition();

  return (
    <form className="space-y-4" onSubmit={(event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      setResult(undefined);
      start(async () => {
        const response = await saveMethod(method?.slug ?? null, data);
        setResult(response);
        if (response.ok && !method) form.reset();
      });
    }}>
      <label className="block text-sm font-semibold">
        Title
        <input className={field} name="title" defaultValue={method?.title} maxLength={120} required />
      </label>
      <label className="block text-sm font-semibold">
        Summary
        <textarea className={field} name="summary" defaultValue={method?.summary} rows={2} maxLength={500} required />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm font-semibold">
          Category
          <select className={field} name="category" defaultValue={method?.category}>
            {methodCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Tier
          <select className={field} name="tier" defaultValue={method?.tier ?? "Free"}>
            <option>Free</option>
            <option>Pro</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Reading time (minutes)
          <input className={field} name="minutes" type="number" min={1} max={180} defaultValue={method?.minutes ?? 5} required />
        </label>
      </div>
      <label className="block text-sm font-semibold">
        Steps
        <span className="ml-2 text-xs font-normal text-ink-muted">One step per line</span>
        <textarea className={field} name="steps" defaultValue={method?.steps.join("\n")} rows={5} maxLength={18030} required />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Publishing…" : method ? "Publish changes" : "Publish method"}
        </Button>
        {result?.ok && <p role="status" className="text-sm text-ink-muted">{result.message}</p>}
        {result?.ok === false && <p role="alert" className="text-sm text-red-700">{result.error}</p>}
      </div>
    </form>
  );
}
