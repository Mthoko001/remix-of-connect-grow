import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signUpSupplierWithEmail } from "@/lib/supplier-auth";
// TODO: add "Continue with Google" button (signUpSupplierWithGoogle) once
// the Google provider is configured on the backend.

export const Route = createFileRoute("/supplier/signup")({
  head: () => ({
    meta: [
      { title: "List Your Business — LeadLink" },
      { name: "description", content: "Create your LeadLink supplier account and start receiving enquiries from local customers." },
      { property: "og:title", content: "List Your Business — LeadLink" },
      { property: "og:description", content: "Create your LeadLink supplier account and start receiving enquiries from local customers." },
    ],
  }),
  component: SupplierSignupPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function SupplierSignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    setErrors(next);
    if (next.email || next.password) return;

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUpSupplierWithEmail({ email, password });
      if (needsEmailConfirmation) {
        setConfirmEmail(true);
      } else {
        navigate({ to: "/supplier/onboarding" });
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Sign-up failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">List your business</CardTitle>
          <CardDescription>
            Create your supplier account to get verified and receive enquiries from local customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmEmail ? (
            <div className="space-y-4 text-center">
              <p className="text-sm">
                We've sent a confirmation link to <strong>{email}</strong>. Confirm your email to
                continue setting up your business profile.
              </p>
              <Link to="/" className="text-sm text-primary underline">
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Creating account…" : "Create supplier account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login" className="text-primary underline">
                  Log in
                </a>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
