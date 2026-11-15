import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WhyGrowMe } from "@/components/landing/why-growme";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedListings } from "@/components/landing/featured-listings";
import { AudienceCta } from "@/components/landing/audience-cta";
import { CategoriesSection } from "@/components/landing/categories-section";
import { PricingCta } from "@/components/landing/pricing-cta";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { ContactSection } from "@/components/landing/contact-section";
import { fetchPublicSuppliers } from "@/lib/public-suppliers.functions";
import { LatestPosts } from "@/components/blog/latest-posts";
import { blogQuery } from "@/lib/blog-queries";
import { useSuspenseQuery } from "@tanstack/react-query";

const META_DESCRIPTION =
  "GrowMeOnline connects customers with verified suppliers, service providers, and product sellers across South Africa. List your business and receive qualified customer leads.";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const [suppliers] = await Promise.all([fetchPublicSuppliers(), context.queryClient.ensureQueryData(blogQuery)]);
    return suppliers;
  },
  errorComponent: () => <div role="alert" className="p-12 text-center">This page couldn’t load. Please refresh and try again.</div>,
  notFoundComponent: () => <div className="p-12 text-center">Page not found.</div>,
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
  const { data: posts } = useSuspenseQuery(blogQuery);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero liveSuppliers={liveSuppliers} />
        <WhyGrowMe />
        <HowItWorks />
        <FeaturedListings liveSuppliers={liveSuppliers} />
        <AudienceCta verifiedCount={liveSuppliers.length} />
        <CategoriesSection />
        <PricingCta />
        <About verifiedCount={liveSuppliers.length} />
        <LatestPosts posts={posts} />
      </main>
      <ContactSection />
      <Footer />
    </div>
  );
}
