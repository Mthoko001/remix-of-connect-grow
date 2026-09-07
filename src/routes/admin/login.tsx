import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/landing/logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Log In — LeadLink" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminLoginPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Admin accounts are provisioned manually (Supabase Dashboard > Authentication
// > Users > Invite user, then a matching row inserted into tb_admin_account).
// There is intentionally no public admin sign-up path.
function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors: typeof errors = {};
    if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
    if (!password) fieldErrors.password = "Enter your password.";
    setErrors(fieldErrors);
    if (fieldErrors.email || fieldErrors.password) return;

    setSubmitting(true);
    // Generic message on purpose: whether the password was wrong or the
    // account simply isn't an admin, we never reveal which — otherwise this
    // form could be used to enumerate valid (non-admin) accounts.
    const GENERIC_ERROR = "Incorrect email or password.";
    try {
      const { data: signInData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !signInData.session) {
        setErrors({ form: GENERIC_ERROR });
        return;
      }

      const { data: adminRow } = await supabase
        .from("tb_admin_account")
        .select("admin_account_id")
        .eq("admin_account_id", signInData.session.user.id)
        .maybeSingle();

      if (!adminRow) {
        await supabase.auth.signOut();
        setErrors({ form: GENERIC_ERROR });
        return;
      }

      navigate({ to: "/admin/dashboard" });
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 left-1/2 h-[420px] w-[680px] max-w-[120vw] -translate-x-1/2 rounded-full bg-foreground/10 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-7 shadow-xl ring-1 ring-black/[0.02] backdrop-blur-xl sm:p-8">
          <div className="flex justify-center">
            <Link to="/" aria-label="LeadLink home">
              <Logo className="scale-110" />
            </Link>
          </div>

          <div className="mt-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
              <ShieldCheck className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Log In</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Restricted access for LeadLink administrators.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="admin_email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="admin_email"
                type="email"
                autoComplete="email"
                placeholder="you@leadlink.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
                className="h-10"
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin_password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="admin_password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Your password"
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

            {errors.form && <p className="text-sm text-destructive">{errors.form}</p>}

            <Button type="submit" disabled={submitting} className="h-10 w-full gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
