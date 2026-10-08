/** Public supplier listing shape, built from validated database records only. */
export type SupplierListing = {
  slug: string;
  supplierAccountId: string;
  name: string;
  initials: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  description: string;
  /** Full business address (only when the supplier provided a street address). */
  fullAddress: string;
  province?: string;
  city?: string;
  suburb?: string;
  /** Suburb/city/postal code only — safe to show on the public profile. */
  publicArea: string;
  cellNo: string;
  /** Shown to customers instead of a phone number they could call. */
  businessHours: string;
  whatsappNumber: string; // digits only, international format, no "+"
  gradient: string; // tailwind gradient classes for the logo avatar
  source?: "live";
  logoUrl?: string | null;
  productImages?: string[];
  businessTypes?: string[];
  services?: string[];
  products?: string[];
  /** ISO date the profile was created. */
  memberSince?: string | null;
  /** Category-based default cover image (relative CDN path). */
  coverUrl?: string;
};


export function groupSuppliersByCategory(
  suppliers: SupplierListing[],
): { category: string; suppliers: SupplierListing[] }[] {
  const verified = suppliers.filter((s) => s.verified);
  const order: string[] = [];
  const byCategory = new Map<string, SupplierListing[]>();
  for (const s of verified) {
    if (!byCategory.has(s.category)) {
      byCategory.set(s.category, []);
      order.push(s.category);
    }
    byCategory.get(s.category)!.push(s);
  }
  return order.map((category) => ({ category, suppliers: byCategory.get(category)! }));
}

/** Highest-rated verified suppliers, for a "Featured" row. */
export function getFeaturedSuppliers(
  count = 6,
  suppliers: SupplierListing[],
): SupplierListing[] {
  return [...suppliers]
    .filter((s) => s.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

