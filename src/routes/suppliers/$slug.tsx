import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone, ShieldCheck, Star } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { SupplierChatDialog } from "@/components/customer/supplier-chat-dialog";
import { WhatsAppEnquiryDialog } from "@/components/customer/whatsapp-enquiry-dialog";
import { getSupplierBySlug, mockProductImages, MOCK_SUPPLIERS } from "@/lib/mock-suppliers";

export const Route = createFileRoute("/suppliers/$slug")({
  loader: ({ params }) => {
    const supplier = getSupplierBySlug(params.slug);
    if (!supplier) throw notFound();
    return supplier;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — LeadLink` : "Supplier — LeadLink" },
      {
        name: "description",
        content: loaderData?.description ?? "View this supplier's business profile on LeadLink.",
      },
    ],
  }),
  component: SupplierPublicProfilePage,
});

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-amber-500 text-amber-500" : "text-border"}`}
        />
      ))}
    </span>
  );
}

function SupplierPublicProfilePage() {
  const supplier = Route.useLoaderData();
  const [chatOpen, setChatOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const productImages = mockProductImages(supplier.slug);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${supplier.gradient} text-xl font-bold text-white`}
            >
              {supplier.initials}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  {supplier.name}
                </h1>
                {supplier.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-verified/10 px-2.5 py-1 text-xs font-semibold text-verified">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{supplier.category}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarRating rating={supplier.rating} />
                  <span className="font-semibold text-foreground">{supplier.rating}</span>
                  <span className="text-muted-foreground">({supplier.reviews} reviews)</span>
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {supplier.location}
                </span>
              </div>
            </div>
          </div>

          {/* Contact actions */}
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setWhatsappOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.99]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </button>
            <Button variant="outline" onClick={() => setChatOpen(true)} className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat in App
            </Button>
          </div>
        </div>

        {/* Description */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-foreground">About</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {supplier.description}
          </p>
        </section>

        {/* Contact details */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Address
              </p>
              <p className="mt-0.5 text-sm text-foreground">{supplier.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Cell Number
              </p>
              <p className="mt-0.5 text-sm text-foreground">{supplier.cellNo}</p>
            </div>
          </div>
        </section>

        {/* Product gallery */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-foreground">Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {productImages.map((src) => (
              <img
                key={src}
                src={src}
                alt={`${supplier.name} work sample`}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
              />
            ))}
          </div>
        </section>

        {/* Other suppliers */}
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-lg font-bold text-foreground">More suppliers</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {MOCK_SUPPLIERS.filter((s) => s.slug !== supplier.slug)
              .slice(0, 3)
              .map((s) => (
                <Link
                  key={s.slug}
                  to="/suppliers/$slug"
                  params={{ slug: s.slug }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br ${s.gradient} text-[10px] font-bold text-white`}
                  >
                    {s.initials}
                  </span>
                  {s.name}
                </Link>
              ))}
          </div>
        </section>
      </main>

      <Footer />

      <SupplierChatDialog open={chatOpen} onOpenChange={setChatOpen} supplierName={supplier.name} />
      <WhatsAppEnquiryDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        supplierAccountId={supplier.supplierAccountId}
        supplierName={supplier.name}
      />
    </div>
  );
}
