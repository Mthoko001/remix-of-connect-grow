import { useEffect, useState } from "react";
import { recordProfileView } from "@/lib/profile-views";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarDays,
  Building2,
  CheckCircle2,
  Clock,
  Images,
  Info,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  Wrench,
  Bus,
  Plane,
  Users,
  Route as RouteIcon,
  BriefcaseBusiness,
  Hotel,
  CarFront,
  CircleHelp,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { FormattedText } from "@/components/customer/formatted-text";
import { OnlinePresence } from "@/components/customer/online-presence";
import { Globe } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { InAppEnquiryDialog } from "@/components/customer/in-app-enquiry-dialog";
import { ImageGalleryLightbox } from "@/components/customer/image-gallery-lightbox";
import { CompanyLogo } from "@/components/company-logo";
import { Button } from "@/components/ui/button";
import { ShareBusiness } from "@/components/customer/share-business";
import { absoluteUrl, categoryCover, SITE_URL, TRANSPORT } from "@/lib/category-cover";
import { fetchPublicSupplierBySlug } from "@/lib/public-suppliers.functions";

export const Route = createFileRoute("/suppliers/$slug")({
  loader: async ({ params }) => {
    const supplier = await fetchPublicSupplierBySlug({ data: params.slug });
    if (!supplier) throw notFound();
    return supplier;
  },
  head: ({ loaderData: s }) => {
    if (!s) return { meta: [{ title: "Supplier — GrowMeOnline" }] };
    const title = `${s.name} — ${s.verified ? "Verified " : ""}${s.category} Supplier | GrowMeOnline`;
    const short = s.description.replace(/\s+/g, " ").slice(0, 155);
    const description = `${s.category} · ${s.location}. ${short}`;
    const image = absoluteUrl(s.coverUrl ?? categoryCover(s.category));
    const url = `${SITE_URL}/suppliers/${s.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "GrowMeOnline" },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
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

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      <div className="pt-4">{children}</div>
    </section>
  );
}

/** Transport-themed icon per service name (display only). */
function transportIcon(service: string): LucideIcon {
  if (/airport|flight/i.test(service)) return Plane;
  if (/corporate|business|staff/i.test(service)) return BriefcaseBusiness;
  if (/group|event|school|passenger/i.test(service)) return Users;
  if (/long distance|point to point/i.test(service)) return RouteIcon;
  if (/hotel/i.test(service)) return Hotel;
  if (/private|chauffeur|executive/i.test(service)) return CarFront;
  return Bus;
}

function SupplierPublicProfilePage() {
  const supplier = Route.useLoaderData();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const productImages = supplier.productImages ?? [];
  const services = supplier.services ?? [];
  const products = supplier.products ?? [];
  const faqs = supplier.faqs ?? [];
  const businessTypes = supplier.businessTypes ?? [];
  // Display-only: shuttle suppliers filed under "Vehicle Services" read as transport, not repairs.
  const isTransport = [supplier.category, ...services].some((v) => v && TRANSPORT.test(v));
  const industry = isTransport ? "Shuttle & Transport Services" : supplier.category;

  const profileUrl = `${SITE_URL}/suppliers/${supplier.slug}`;
  const memberSince = supplier.memberSince
    ? new Date(supplier.memberSince).toLocaleDateString("en-ZA", { month: "long", year: "numeric" })
    : "";

  useEffect(() => {
    void recordProfileView(supplier.supplierAccountId);
  }, [supplier.supplierAccountId]);

  // Only non-contact fields. Never phone, email or website; never the street address.
  const info = [
    { label: "Industry", value: industry, icon: Building2 },
    { label: "Business Type", value: businessTypes.join(" & "), icon: Briefcase },
    { label: "Location", value: supplier.location, icon: MapPin },
    { label: "Operating Hours", value: supplier.businessHours, icon: Clock },
  ].filter((i) => i.value && i.value.trim().length > 0);

  const enquiryButton = (
    <Button size="lg" onClick={() => setEnquiryOpen(true)} className="w-full sm:w-auto">
      <MessageCircle className="h-4 w-4" />
      Send Enquiry
    </Button>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        {/* Hero */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="relative h-[180px] sm:h-[260px] lg:h-[320px]">
            <img
              src={supplier.coverUrl ?? categoryCover(supplier.category)}
              alt={`${industry} cover`}
              width={1600}
              height={640}
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
          </div>
          <div className="px-5 pb-6 sm:px-8">
            <div className="relative z-10 -mt-12 w-fit rounded-xl border-4 border-card bg-card shadow">
              <CompanyLogo
                src={supplier.logoUrl}
                fallbackPhoto={supplier.coverUrl}
                name={supplier.name}
                initials={supplier.initials}
                fallbackClassName={`bg-gradient-to-br ${supplier.gradient}`}
              />
            </div>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {supplier.name}
                  </h1>
                  {supplier.verified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-verified/10 px-2.5 py-1 text-xs font-semibold text-verified">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Supplier
                    </span>
                  )}
                </div>
                <p className="break-words text-sm font-medium text-foreground/80">
                  {[industry, ...businessTypes].join(" · ")}
                </p>
                <p className="flex items-start gap-1 break-words text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  {supplier.location}
                </p>
                {memberSince && (
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    Member since {memberSince}
                  </p>
                )}
              </div>
              <div className="shrink-0">{enquiryButton}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {supplier.description.trim() && (
              <Section title="About the Business" icon={Info}>
                <FormattedText text={supplier.description} />
              </Section>
            )}

            {(supplier.socialLinks ?? []).length > 0 && (
              <Section title="Social Links" icon={Globe}>
                <OnlinePresence socials={supplier.socialLinks ?? []} />
              </Section>
            )}

            {products.length > 0 && (
              <Section title="Products" icon={Package}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {products.map((p) => (
                    <div key={p} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Package className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{p}</p>
                        <p className="text-xs text-muted-foreground">{supplier.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {services.length > 0 && (
              <Section title="Services" icon={isTransport ? Bus : Wrench}>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {services.map((s) => {
                    const Icon = isTransport ? transportIcon(s) : CheckCircle2;
                    return (
                    <li key={s} className="flex items-center gap-2 text-sm text-foreground">
                      <Icon className="h-4 w-4 shrink-0 text-verified" />
                      {s}
                    </li>
                    );
                  })}
                </ul>
              </Section>
            )}

            {faqs.length > 0 && (
              <Section title="Frequently Asked Questions" icon={CircleHelp}>
                <div className="space-y-2">
                  {faqs.map((f) => (
                    <details
                      key={f.question}
                      className="group rounded-lg border border-border bg-background"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                        {f.question}
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                        {f.answer}
                      </p>
                    </details>
                  ))}
                </div>
                <p className="pt-4 text-sm text-muted-foreground">
                  Looking for more options?{" "}
                  <Link
                    to="/suppliers"
                    search={{ q: supplier.category }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Browse {industry} suppliers on GrowMeOnline
                  </Link>
                </p>
              </Section>
            )}

            {productImages.length > 0 && (
              <Section title="Gallery" icon={Images}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {productImages.map((src, index) => (
                    <Button
                      key={src}
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Open ${supplier.name} image ${index + 1}`}
                      className="group aspect-[4/3] h-auto w-full overflow-hidden rounded-xl border-border bg-muted p-0 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <img
                        src={src}
                        alt={`${supplier.name} work sample ${index + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                      />
                    </Button>
                  ))}
                </div>
              </Section>
            )}

            {supplier.reviews > 0 && (
              <Section title="Reviews & Ratings" icon={Star}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-extrabold text-foreground">{supplier.rating}</span>
                  <div>
                    <StarRating rating={supplier.rating} />
                    <p className="text-xs text-muted-foreground">{supplier.reviews} reviews</p>
                  </div>
                </div>
              </Section>
            )}
          </div>

          <aside className="space-y-6">
            {info.length > 0 && (
              <Section title="Business Information" icon={Building2}>
                <dl className="space-y-4">
                  {info.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {label}
                        </dt>
                        <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </Section>
            )}
            <ShareBusiness url={profileUrl} name={supplier.name} />
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Interested in this business?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enquiries are sent securely through GrowMeOnline.
              </p>
              <div className="mt-4 [&>button]:w-full">{enquiryButton}</div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <InAppEnquiryDialog
        open={enquiryOpen}
        onOpenChange={setEnquiryOpen}
        supplierAccountId={supplier.supplierAccountId}
        supplierName={supplier.name}
      />
      <ImageGalleryLightbox
        images={productImages}
        supplierName={supplier.name}
        selectedIndex={selectedImageIndex}
        onSelectedIndexChange={setSelectedImageIndex}
      />
    </div>
  );
}
