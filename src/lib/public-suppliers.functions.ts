import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupplierListing } from "@/lib/supplier-listing";

const publicSupplierRowSchema = z.object({
  supplier_profile_id: z.number(),
  supplier_account_id: z.string(),
  business_name: z.string(),
  business_description: z.string().nullable(),
  public_area: z.string().nullable(),
  category_name: z.string().nullable(),
  business_logo: z.string().nullable().optional(),
  product_images: z.array(z.string()).nullable().optional(),
});

type PublicSupplierRow = z.infer<typeof publicSupplierRowSchema>;

const AVATAR_GRADIENTS = [
  "from-amber-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-green-600",
  "from-sky-500 to-blue-600",
  "from-rose-500 to-pink-600",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type SignedUrls = Map<string, string>;

/** Signs private supplier-media paths (rows come only from the validated-only view). */
async function signMedia(rows: PublicSupplierRow[]): Promise<SignedUrls> {
  const paths = Array.from(
    new Set(
      rows.flatMap((r) => [r.business_logo ?? "", ...(r.product_images ?? [])]).filter(Boolean),
    ),
  );
  const map: SignedUrls = new Map();
  if (paths.length === 0) return map;
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.storage.from("supplier-media").createSignedUrls(paths, 3600);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) map.set(item.path, item.signedUrl);
    }
  } catch (error) {
    console.error(error);
  }
  return map;
}

function toSupplierListing(profile: PublicSupplierRow, urls: SignedUrls): SupplierListing {
  const name = profile.business_name.trim() || "LeadLink Supplier";
  const area = profile.public_area?.trim() || "Location not provided";

  return {
    slug: `live-${profile.supplier_profile_id}-${slugify(name) || "supplier"}`,
    supplierAccountId: profile.supplier_account_id,
    name,
    initials: initials(name),
    category: profile.category_name ?? "Other",
    rating: 0,
    reviews: 0,
    location: area,
    verified: true,
    description: profile.business_description?.trim() || "Business profile on LeadLink.",
    fullAddress: "",
    publicArea: area,
    cellNo: "",
    businessHours: "Contact supplier for business hours.",
    whatsappNumber: "",
    gradient:
      AVATAR_GRADIENTS[profile.supplier_profile_id % AVATAR_GRADIENTS.length] ??
      "from-amber-500 to-orange-500",
    source: "live",
    logoUrl: profile.business_logo ? (urls.get(profile.business_logo) ?? null) : null,
    productImages: (profile.product_images ?? [])
      .map((path) => urls.get(path))
      .filter((u): u is string => Boolean(u)),
  };
}

function publicSuppliersUrl(query: string): { url: string; apiKey: string } {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const apiKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !apiKey) {
    throw new Error("Missing Supabase URL or publishable key for public supplier listings.");
  }
  return {
    url: `${url.replace(/\/$/, "")}/rest/v1/tb_public_supplier_listing?${query}`,
    apiKey,
  };
}

async function fetchPublicSupplierRows(query: string): Promise<PublicSupplierRow[]> {
  const { url, apiKey } = publicSuppliersUrl(query);
  const response = await fetch(url, {
    headers: {
      apikey: apiKey,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Could not load public suppliers (${response.status}): ${detail}`);
  }

  return z.array(publicSupplierRowSchema).parse(await response.json());
}

export const fetchPublicSuppliers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const profiles = await fetchPublicSupplierRows(
      "select=supplier_profile_id,supplier_account_id,business_name,business_description,public_area,category_name,business_logo,product_images&order=business_name.asc",
    );
    const urls = await signMedia(profiles);
    return profiles.map((p) => toSupplierListing(p, urls));
  } catch (error) {
    // Fail soft: show an empty directory rather than crash the page.
    console.error(error);
    return [] as SupplierListing[];
  }
});

export const fetchPublicSupplierBySlug = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const match = /^live-(\d+)-/.exec(slug);
    if (!match) return null;

    const profileId = Number(match[1]);
    if (!Number.isSafeInteger(profileId) || profileId <= 0) return null;

    const profiles = await fetchPublicSupplierRows(
      `select=supplier_profile_id,supplier_account_id,business_name,business_description,public_area,category_name,business_logo,product_images&supplier_profile_id=eq.${profileId}&limit=1`,
    );
    const profile = profiles[0];
    if (!profile) return null;
    return toSupplierListing(profile, await signMedia([profile]));
  });
