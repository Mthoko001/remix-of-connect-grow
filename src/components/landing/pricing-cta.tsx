import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const POINTS = [
  "Your first 5 qualified leads are completely free",
  "Only approved, genuine customer enquiries count toward your quota",
  "Rejected or spam enquiries never count against you",
  "Upgrade to an active subscription for unlimited qualified leads",
];

export function PricingCta() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="overflow-hidden rounded-3xl bg-brand px-6 py-12 shadow-2xl shadow-brand/25 sm:px-12 lg:px-16">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-glow">
                Simple Pricing
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Your First 5 Qualified Leads Free
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/80">
                We only count leads that are worth your time. Enquiries are
                reviewed by our team first, so your free quota is spent on real
                customer opportunities — not spam.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  See Pricing
                </Link>
                <Link
                  to="/supplier/signup"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  List My Business
                </Link>
              </div>
            </div>

            <ul className="space-y-4">
              {POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-glow text-brand">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-relaxed text-white sm:text-base">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
