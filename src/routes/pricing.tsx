import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

const TITLE = "Pricing — LeadLink";
const DESCRIPTION =
  "One simple annual subscription to list your business on LeadLink, get verified and receive customer enquiries.";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PricingPage,
});

const FEATURES = [
  "Verified business listing on LeadLink",
  "Business profile with logo and up to 6 photos",
  "Customer enquiries via WhatsApp and in-app messaging",
  "Supplier dashboard with enquiry tracking",
  "Listed in category browsing and search",
  "Verified badge shown to customers",
];

const STEPS = [
  { title: "Create your profile", body: "Sign up free and complete your business profile." },
  { title: "Get verified", body: "Our team reviews your details before you go live." },
  { title: "Subscribe and go live", body: "Pay once a year and start receiving enquiries." },
];

const FAQS = [
  {
    q: "Is there a fee to sign up?",
    a: "No. Creating an account and building your profile is free. You only pay once your profile is verified and you are ready to go live.",
  },
  {
    q: "Do you take a commission on jobs?",
    a: "No. The annual subscription is the only cost. Enquiries go directly to you.",
  },
  {
    q: "What happens if my profile is not approved?",
    a: "You will see the reason on your dashboard, can update your details and resubmit. You are not charged until you are verified.",
  },
];

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pb-8 pt-14 text-center sm:px-6 lg:pt-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Pricing</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            One simple annual plan
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            No commission, no per-lead fees. Pay once a year and get found by customers looking
            for trusted local suppliers.
          </p>
        </section>

        <section className="mx-auto max-w-lg px-4 pb-16 sm:px-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-brand/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Supplier Annual</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2.5 py-1 text-xs font-semibold text-verified">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified listing
              </span>
            </div>
            <p className="mt-5 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-foreground">R1,200</span>
              <span className="text-sm text-muted-foreground">/ year</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Billed once a year. Cancel any time.</p>

            <ul className="mt-6 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-verified" />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href="/supplier/signup"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-glow px-5 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5"
            >
              List My Business
            </a>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Free to sign up. Pay only after you are verified.
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
            <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground">
              How billing works
            </h2>
            <ol className="mt-8 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl border border-border bg-card p-5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-foreground">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-foreground">
            Questions
          </h2>
          <dl className="mt-8 space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border bg-card p-5">
                <dt className="text-sm font-bold text-foreground">{f.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Looking for a supplier instead?{" "}
            <Link to="/suppliers" className="font-semibold text-brand hover:underline">
              Browse suppliers
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
