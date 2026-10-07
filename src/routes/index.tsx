import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WhyGrowMe } from "@/components/landing/why-growme";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedListings } from "@/components/landing/featured-listings";
import { CategoriesSection } from "@/components/landing/categories-section";
import { PricingCta } from "@/components/landing/pricing-cta";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { fetchPublicSuppliers } from "@/lib/public-suppliers.functions";

const META_DESCRIPTION =
  "GrowMeOnline connects customers with verified suppliers, service providers, and product sellers across South Africa. List your business and receive qualified customer leads.";

export const Route = createFileRoute("/")({
  loader: () => fetchPublicSuppliers(),
  head: () => ({
    meta: [
      { title: "GrowMeOnline — Grow Your Business Online" },
      { name: "description", content: META_DESCRIPTION },
      { property: "og:title", content: "GrowMeOnline — Grow Your Business Online" },
      { property: "og:description", content: META_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
        <Hero liveSuppliers={liveSuppliers} />
        <WhyGrowMe />
        <HowItWorks />
        <FeaturedListings liveSuppliers={liveSuppliers} />
        <CategoriesSection />
        <PricingCta />
        <About verifiedCount={liveSuppliers.length} />
      </main>
      <Footer />
    </div>
  );
}
