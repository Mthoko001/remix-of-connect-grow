import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/supplier/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — LeadLink Supplier Onboarding" },
      { name: "description", content: "Set up your LeadLink business profile." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SupplierOnboardingPage,
});

function SupplierOnboardingPage() {
  // TODO(next prompt): business profile form (name, category, logo, etc.)
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Welcome to LeadLink</h1>
        <p className="mt-3 text-muted-foreground">
          Let's set up your business profile. This is where you'll add your business details, get
          verified, and start receiving enquiries.
        </p>
      </div>
    </main>
  );
}
