import { useCallback, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpSupplierWithEmail } from "@/lib/supplier-auth";
import { Logo } from "@/components/landing/logo";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/supplier/signup")({
  head: () => ({
    meta: [
      { title: "List Your Business — LeadLink" },
      {
        name: "description",
        content:
          "Create your LeadLink supplier account and start receiving enquiries from local customers.",
      },
      { property: "og:title", content: "List Your Business — LeadLink" },
      {
        property: "og:description",
        content:
          "Create your LeadLink supplier account and start receiving enquiries from local customers.",
      },
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    captcha?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const handleCaptchaTokenChange = useCallback((token: string) => {
    setCaptchaToken(token);
    if (token) setErrors((current) => ({ ...current, captcha: "" }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
    if (!captchaToken) next.captcha = "Complete the verification before creating your account.";
    setErrors(next);
    if (next.email || next.password || next.confirmPassword || next.captcha) return;

    setSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUpSupplierWithEmail({
        email,
        password,
        captchaToken,
      });
      if (needsEmailConfirmation) {
        setConfirmEmail(true);
      } else {
        navigate({ to: "/supplier/dashboard" });
      }
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Sign-up failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setCaptchaToken("");
      setCaptchaResetKey((key) => key + 1);
    }
  }

  // TODO: wire up Supabase Google OAuth here — replace this placeholder toast
  // with supabase.auth.signInWithOAuth({ provider: "google", ... }) once the
  // Google provider is configured on the backend.
  function handleGoogleClick() {
    toast("Google sign-up is coming soon.", {
      description: "Email sign-up works today — continue below.",
    });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-16">
      {/* Subtle branded background glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 rounded-full bg-brand/15 blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] h-[320px] w-[320px] rounded-full bg-brand-glow/10 blur-3xl" />
        <div className="absolute left-[-4rem] top-1/3 h-[280px] w-[280px] rounded-full bg-verified/10 blur-3xl" />
      </div>

      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-7 shadow-xl shadow-brand/5 ring-1 ring-black/[0.02] backdrop-blur-xl sm:p-8">
          {/* Logo */}
          <div className="flex justify-center">
            <Link to="/" aria-label="LeadLink home">
              <Logo className="scale-110" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Create your Supplier account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Get verified and start receiving enquiries from local customers.
            </p>
          </div>

          {confirmEmail ? (
            <div className="mt-8 space-y-4 rounded-xl border border-border bg-muted/30 p-5 text-center">
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-verified/15 text-verified">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-sm text-foreground">
                We've sent a confirmation link to <strong className="font-semibold">{email}</strong>
                . Confirm your email to continue setting up your business profile.
              </p>
              <Link
                to="/"
                className="inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              {/* Google sign-up */}
              <button
                type="button"
                onClick={handleGoogleClick}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted/60 hover:shadow active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <GoogleGIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  or sign up with email
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Email / password form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    className="h-10"
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={!!errors.password}
                      className="h-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute inset-y-0 right-0 grid w-10 place-items-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!!errors.confirmPassword}
                    className="h-10"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <TurnstileWidget
                  onTokenChange={handleCaptchaTokenChange}
                  resetKey={captchaResetKey}
                />
                {errors.captcha && <p className="text-sm text-destructive">{errors.captcha}</p>}

                {/* Consent text */}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  By creating an account, you agree to LeadLink's{" "}
                  <a
                    href="/terms"
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy"
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>

                {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

                <Button
                  type="submit"
                  disabled={submitting || !captchaToken}
                  className="h-10 w-full gap-2 bg-gradient-to-r from-brand to-brand-glow text-brand-foreground shadow-lg shadow-brand/25 transition-all hover:shadow-brand/40 hover:brightness-105 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Creating account…" : "Create supplier account"}
                </Button>
              </form>
            </>
          )}

          {/* Log in link */}
          {!confirmEmail && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                Log in
              </a>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

/** Standard multicolor Google "G" logo. */
function GoogleGIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
