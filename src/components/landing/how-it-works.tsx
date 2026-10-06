import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

const CUSTOMER_JOURNEY = [
  "Browse verified suppliers by category and location",
  "Send an enquiry straight from a supplier's profile",
  "The GrowMeOnline team reviews and forwards your enquiry",
  "The supplier responds and you get the job done",
];

const SUPPLIER_JOURNEY = [
  "List your business with a free supplier profile",
  "Get verified by the GrowMeOnline team",
  "Receive qualified customer leads in your dashboard",
  "Grow your business with a trusted public profile",
];

function JourneyColumn({
  label,
  title,
  steps,
}: {
  label: string;
  title: string;
  steps: string[];
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">{label}</p>
      <h3 className="mt-2 text-xl font-bold text-foreground">{title}</h3>
      <ol className="mt-6 space-y-5">
        {steps.map((step, i) => (
          <li key={step} className="flex items-start gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
              {i + 1}
            </span>
            <p className="pt-1 text-sm leading-relaxed text-foreground sm:text-base">
              {step}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-border/60 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            How It Works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Two journeys, one trusted platform
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Whether you're looking for a supplier or looking for customers,
            GrowMeOnline keeps it simple from start to finish.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <JourneyColumn
            label="Customer Journey"
            title="Find a supplier you can trust"
            steps={CUSTOMER_JOURNEY}
          />
          <JourneyColumn
            label="Supplier Journey"
            title="Turn enquiries into qualified leads"
            steps={SUPPLIER_JOURNEY}
          />
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/suppliers"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:w-auto"
          >
            <Check className="h-4 w-4 text-verified" aria-hidden="true" />
            Browse Suppliers
          </Link>
          <Link
            to="/supplier/signup"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30 sm:w-auto"
          >
            List My Business
          </Link>
        </div>
      </div>
    </section>
  );
}
