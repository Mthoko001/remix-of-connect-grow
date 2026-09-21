import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/supplier-auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — LeadLink" },
      {
        name: "description",
        content:
          "Reset the password for your LeadLink supplier account and get back to managing your enquiries.",
      },
      { property: "og:title", content: "Reset Your Password — LeadLink" },
      {
        property: "og:description",
        content:
          "Reset the password for your LeadLink supplier account and get back to managing your enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      // Always show the same confirmation, whether or not the email is
      // registered — never reveal account existence through this form.
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
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

          {sent ? (
            <>
              <div className="mx-auto mt-6 grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">{email}</span>, we've sent a link to
                reset your password. It may take a minute to arrive.
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                Forgot your password?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a link to reset it.
              </p>

              <form
                onSubmit={(e) => void handleSubmit(e)}
                className="mt-6 space-y-4 text-left"
                noValidate
              >
                <div className="space-y-1.5">
                  <Label htmlFor="fp_email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="fp_email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                    className="h-10"
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>

                <Button type="submit" disabled={submitting} className="h-10 w-full gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          <Link
            to="/login"
            className="mt-6 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        </div>
      </div>
    </main>
  );
}
