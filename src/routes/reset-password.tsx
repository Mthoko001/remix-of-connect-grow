import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { updatePassword } from "@/lib/supplier-auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Set a New Password — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

type LinkState = "checking" | "valid" | "invalid";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [linkState, setLinkState] = useState<LinkState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let settled = false;

    // Supabase's client auto-detects the recovery token in the URL and
    // establishes a temporary session, firing this event.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        settled = true;
        setLinkState("valid");
      }
    });

    // The event may have already fired before this listener attached —
    // fall back to checking for an existing session.
    supabase.auth.getSession().then(({ data }) => {
      if (!settled && data.session) {
        settled = true;
        setLinkState("valid");
      }
    });

    // Neither fired within a few seconds: the link is missing, expired, or
    // already used.
    const timeout = setTimeout(() => {
      if (!settled) setLinkState("invalid");
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate({ to: "/supplier/dashboard" }), 1500);
    } catch {
      setError("Couldn't update your password. Please request a new reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
      </div>

      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-7 text-center shadow-xl shadow-brand/5 backdrop-blur-xl sm:p-8">
          <div className="flex justify-center">
            <Link to="/" aria-label="LeadLink home">
              <Logo className="scale-110" />
            </Link>
          </div>

          {linkState === "checking" && (
            <>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                Verifying your link…
              </h1>
              <Loader2 className="mx-auto mt-4 h-5 w-5 animate-spin text-muted-foreground" />
            </>
          )}

          {linkState === "invalid" && (
            <>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                This link isn't valid
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                It may have expired or already been used. Request a new one below.
              </p>
              <Link
                to="/forgot-password"
                className="mt-6 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Request a new link
              </Link>
            </>
          )}

          {linkState === "valid" && done && (
            <>
              <div className="mx-auto mt-6 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                Password updated
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Taking you to your dashboard…</p>
            </>
          )}

          {linkState === "valid" && !done && (
            <>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                Set a new password
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a new password for your account.
              </p>

              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="mt-6 space-y-4 text-left"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="rp_password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="rp_password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rp_confirm" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="rp_confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button type="submit" disabled={submitting} className="h-10 w-full gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Updating…" : "Update password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
