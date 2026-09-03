import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

// Placeholder nav links. In-page sections use hash anchors (#how-it-works, #about);
// Categories / Pricing point at placeholder paths whose route files are not built yet,
// so they use plain <a href> to avoid TanStack type-safe-link errors. Replace with
// <Link> once those routes exist.
const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Categories", href: "/categories" },
  { label: "Pricing", href: "/pricing" },
  { label: "About Us", href: "#about" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="min-w-0" aria-label="LeadLink home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="text-sm font-semibold text-foreground transition-colors hover:text-brand"
          >
            Log In
          </a>
          <a
            href="/supplier/signup"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-brand to-brand-glow px-4 py-2 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand/30"
          >
            List My Business
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-accent md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
              >
                Log In
              </a>
              <a
                href="/supplier/signup"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand to-brand-glow px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25"
              >
                List My Business
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
