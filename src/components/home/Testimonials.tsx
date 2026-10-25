import { Star } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

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
    tone: "bg-[#3b5bdb] text-white",
  },
];

export function Testimonials() {
  return (
    <section className="container-page py-12">
      <Reveal className="flex flex-col gap-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-2">Reviews</p>
        <h2 className="t-h2 text-ink">What buyers and sellers say</h2>
      </Reveal>
      <Stagger className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        {quotes.map((q) => (
          <StaggerItem key={q.name} className="h-full">
            <figure className="card flex h-full flex-col p-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink">“{q.body}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className={`grid h-9 w-9 place-items-center rounded-full text-[14px] font-bold ${q.tone}`}>{q.name[0]}</span>
                <span>
                  <span className="block text-[14px] font-semibold text-ink">{q.name}</span>
                  <span className="block text-[12px] text-ink-faint">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
