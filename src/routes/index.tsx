import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturedListings } from "@/components/landing/featured-listings";
import { About } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LeadLink — Find Trusted Local Suppliers" },
      {
        name: "description",
        content:
          "LeadLink connects customers with verified local suppliers. List your business, get verified, and start receiving enquiries via WhatsApp or in-app chat.",
      },
      { property: "og:title", content: "LeadLink — Find Trusted Local Suppliers" },
      {
        property: "og:description",
        content:
          "LeadLink connects customers with verified local suppliers. List your business, get verified, and start receiving enquiries via WhatsApp or in-app chat.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <FeaturedListings />
        <About />
      </main>
      <Footer />
    </div>
  );
}
