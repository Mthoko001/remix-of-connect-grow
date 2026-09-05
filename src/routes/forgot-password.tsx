import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/landing/logo";

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

function ForgotPasswordPage() {
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
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Password reset is coming soon. For now, please contact LeadLink
            support and we'll help you get back into your account.
          </p>
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
