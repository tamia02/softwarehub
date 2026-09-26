import { Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Tilt } from "@/components/motion/Tilt";

const quotes = [
  {
    body: "Bought the Pro Pass and unlocked the whole stack with one code. Paid for itself in the first week — no more juggling ten subscriptions.",
    name: "Aditya R.",
    role: "Indie founder",
    tone: "bg-accent text-on-accent",
  },
  {
    body: "The escrow made me trust the marketplace instantly. Ordered a key, it landed in seconds, and my money was safe until I confirmed.",
    name: "Meera S.",
    role: "Reseller",
    tone: "bg-primary text-on-primary",
  },
  {
    body: "I plugged the Grow API straight into my own panel. Orders auto-dispatch, refills are automatic, and my margins finally make sense.",
    name: "Kabir N.",
    role: "Agency owner",
    tone: "bg-accent-2 text-white",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-12 md:py-16">
      <Reveal className="flex flex-col items-center gap-2 text-center">
        <h2 className="t-h2 text-ink">Loved by builders</h2>
        <p className="font-hand text-[24px] text-accent-2 md:text-[28px]">real people, real results</p>
      </Reveal>
      <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
        {quotes.map((q) => (
          <StaggerItem key={q.name} className="h-full">
            <Tilt max={5} className="h-full rounded-[var(--r-card)] [transform-style:preserve-3d]">
              <figure className="flex h-full flex-col rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-6 shadow-[5px_5px_0_var(--offset-card)]">
                <div className="flex gap-0.5 [transform:translateZ(18px)]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className="fill-accent text-accent" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-[1.55] text-ink">“{q.body}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full border-2 border-ink-line font-black ${q.tone}`}>{q.name[0]}</span>
                  <span>
                    <span className="block text-[14px] font-black text-ink">{q.name}</span>
                    <span className="block text-[12px] text-ink-faint">{q.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
