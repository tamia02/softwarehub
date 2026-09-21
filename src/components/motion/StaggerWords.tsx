/**
 * Splits text into words and staggers them in (opacity + 12 px rise, 40 ms/word).
 * Pure CSS so the headline is visible in the SSR HTML before hydration.
 */
export function StaggerWords({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  highlight,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
  delay?: number;
  /** Words (exact match) rendered in the primary colour. */
  highlight?: string[];
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => {
        const hl = highlight?.includes(w.replace(/[^\w$+%,.]/g, ""));
        return (
          <span key={i} aria-hidden className={hl ? "anim-word text-primary" : "anim-word"} style={{ animationDelay: `${delay + i * 0.04}s` }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}
