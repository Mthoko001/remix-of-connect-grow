import {
  BadgeCheck,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const REASONS: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: BadgeCheck,
    title: "Verified Suppliers",
    desc: "Every business is reviewed and approved by the GrowMeOnline team before it goes live, so customers always deal with real, trustworthy suppliers.",
  },
  {
    icon: Target,
    title: "Qualified Leads",
    desc: "Customer enquiries are reviewed before they reach you, so your inbox is filled with genuine opportunities — not spam.",
  },
  {
    icon: Sparkles,
    title: "First 5 Qualified Leads Free",
    desc: "Start receiving qualified customer leads at no cost. No subscription needed to get going — upgrade only when you're ready to grow.",
  },
  {
    icon: TrendingUp,
    title: "Grow Online",
    desc: "A professional public profile showcases your services and products, helping your business get discovered by customers nationwide.",
  },
];

export function WhyGrowMe() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Why GrowMeOnline
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Built to help South African businesses grow
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A trusted platform that connects real customers with verified
            businesses — and turns enquiries into qualified leads.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <r.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
