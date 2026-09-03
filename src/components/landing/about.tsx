const STATS = [
  { value: "1,200+", label: "Verified suppliers" },
  { value: "18k", label: "Enquiries sent" },
  { value: "4.8★", label: "Avg. supplier rating" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-20 border-t border-border/60 bg-card/30">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            About LeadLink
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Connecting customers directly with verified local suppliers
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            LeadLink's mission is simple: make it effortless for customers to
            find businesses they can actually trust. Every supplier on LeadLink
            is reviewed and verified before they go live, so you're never
            gambling on quality. And because enquiries go straight to the
            supplier — via WhatsApp or in-app chat — there's no middleman
            taking a cut of the conversation.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            For suppliers, that means a steady stream of real, local enquiries
            and a profile that signals credibility from the first message.
          </p>

          <div className="mt-8">
            <a
              href="/supplier/signup"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-glow px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30"
            >
              List My Business
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-background p-5 text-center shadow-sm"
            >
              <p className="text-2xl font-extrabold tracking-tight text-brand sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
