import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedListings } from "@/components/landing/featured-listings";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { fetchPublicSuppliers } from "@/lib/public-suppliers.functions";

export const Route = createFileRoute("/")({
  loader: () => fetchPublicSuppliers(),
  head: () => ({
    meta: [
      { title: "GrowMeOnline — Find Trusted Local Suppliers" },
      {
        name: "description",
        content:
          "GrowMeOnline connects customers with verified local suppliers. List your business, get verified, and start receiving enquiries via WhatsApp or in-app chat.",
      },
      { property: "og:title", content: "GrowMeOnline — Find Trusted Local Suppliers" },
      {
        property: "og:description",
        content:
          "GrowMeOnline connects customers with verified local suppliers. List your business, get verified, and start receiving enquiries via WhatsApp or in-app chat.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const liveSuppliers = Route.useLoaderData();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturedListings liveSuppliers={liveSuppliers} />
        <About verifiedCount={liveSuppliers.length} />
      </main>
      <Footer />
    </div>
  );
}
