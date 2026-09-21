/** Simple long-form text wrapper for legal pages. */
export function Prose({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="container-page max-w-3xl py-16">
      <h1 className="text-[36px] font-black leading-tight">{title}</h1>
      <p className="mt-2 text-sm text-ink-faint">Last updated {updated}</p>
      <div className="mt-8 space-y-6 text-[16px] leading-relaxed text-ink-muted [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </article>
  );
}
