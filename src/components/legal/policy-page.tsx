import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/landing/logo";
import { POLICIES_LAST_UPDATED } from "@/lib/policies";

export type PolicySection = { id: string; title: string; body: ReactNode };

export function PolicyPage({
  title,
  version,
  intro,
  sections,
}: {
  title: string;
  version: string;
  intro: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" aria-label="GrowMeOnline home">
            <Logo />
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/terms-and-conditions" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>
              Terms
            </Link>
            <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "font-semibold text-foreground" }}>
              Privacy
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Version {version} · Last updated {POLICIES_LAST_UPDATED}
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>

        <nav aria-label="Contents" className="mt-8 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-sm font-semibold text-foreground">Contents</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-primary underline-offset-4 hover:underline">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-foreground">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
