import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/landing/logo";
import { supabase } from "@/integrations/supabase/client";
import { AUTH_NEXT_STORAGE_KEY, sanitizeNextPath } from "@/lib/supplier-auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  // Browser-only: the Supabase client reads its session from localStorage.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Signing you in… — GrowMeOnline" },
      {
        name: "description",
        content: "Completing your Google sign-in to GrowMeOnline.",
      },
      { property: "og:title", content: "Signing you in… — GrowMeOnline" },
      { property: "og:description", content: "Completing your Google sign-in to GrowMeOnline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthCallback,
});

/**
 * Public same-origin landing point for the Google OAuth round trip.
 * Waits for Supabase to hydrate the session, then sends the user to the
 * stored intended destination (or the supplier dashboard).
 */
function AuthCallback() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const next = sanitizeNextPath(sessionStorage.getItem(AUTH_NEXT_STORAGE_KEY) ?? undefined);
      sessionStorage.removeItem(AUTH_NEXT_STORAGE_KEY);

      // The OAuth redirect lands here with tokens in the URL; give the
      // Supabase client a few seconds to exchange them for a session.
      for (let attempt = 0; attempt < 20; attempt += 1) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) window.location.replace(next ?? "/supplier/dashboard");
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (!cancelled) setFailed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[440px] rounded-2xl border border-border/60 bg-card/80 p-7 text-center shadow-xl shadow-brand/5 backdrop-blur-xl sm:p-8">
        <div className="flex justify-center">
          <Logo className="scale-110" />
        </div>
        {failed ? (
          <>
            <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">
              We couldn't complete Google sign-in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The sign-in didn't finish in time. Please try again, or use your email and password.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-r from-brand to-brand-glow text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/25"
              >
                Try again
              </Link>
              <Link
                to="/"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-semibold text-foreground"
              >
                Back to home
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
            <p className="text-sm text-muted-foreground">Signing you in…</p>
          </div>
        )}
      </div>
    </main>
  );
}
