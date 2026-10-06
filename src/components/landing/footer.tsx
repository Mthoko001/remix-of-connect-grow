import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Logo } from "./logo";

// TODO: add Contact once a dedicated contact page exists (footer block for now).
const QUICK_LINKS = [
  { label: "About", href: "/#about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Browse Suppliers", href: "/suppliers" },
  { label: "Pricing", href: "/pricing" },
  { label: "List My Business", href: "/supplier/signup" },
  { label: "Contact Us", href: "/#contact" },
] as const;

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
] as const;

// TODO: add social media links once real accounts exist.

export function Footer() {
  return (
    <footer id="contact" className="scroll-mt-20 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-xs">
            <Link to="/" aria-label="GrowMeOnline home">
              <Logo />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              GrowMeOnline connects customers with verified South African
              suppliers, service providers, and product sellers.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact Us</h3>
            <a
              href="mailto:support@growmeonline.co.za"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Mail className="h-4 w-4 text-brand" aria-hidden="true" />
              support@growmeonline.co.za
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Ready to reach more local customers?
            </p>
            <a
              href="/supplier/signup"
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30"
            >
              List My Business
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} GrowMeOnline. All rights reserved.</p>
          <p>Connecting customers with trusted local suppliers.</p>
        </div>
      </div>
    </footer>
  );
}
