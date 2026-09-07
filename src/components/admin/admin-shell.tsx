import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  Tags,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/landing/logo";

export const ADMIN_NAV_ITEMS = [
  { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Verification Queue", to: "/admin/verification", icon: ClipboardCheck },
  { label: "Live Suppliers", to: "/admin/suppliers", icon: Store },
  { label: "Categories", to: "/admin/categories", icon: Tags },
  { label: "Audit Log", to: "/admin/audit-log", icon: History },
] as const;

export function AdminShell({ email, children }: { email: string | null; children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-card/95 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Logo />
            <span className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            {email && (
              <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            )}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 flex-col border-r border-border/60 bg-card/60 lg:flex">
          {nav}
        </aside>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card shadow-2xl">
              <div className="flex h-16 items-center justify-between px-4">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {nav}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
