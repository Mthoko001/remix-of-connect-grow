/**
 * DUMMY DATA — for the customer-journey UI prototype only.
 *
 * This is not wired to Supabase. Once the real customer-facing search/
 * profile pages are built against tb_supplier_profile + tb_category, this
 * file (and everything importing it) can be swapped out without touching
 * page structure — the shape below deliberately mirrors what the real
 * schema will look like (slug instead of category_id, but same idea).
 */

export type MockSupplier = {
  slug: string;
  /**
   * A real tb_supplier_account row created for this demo supplier, so
   * enquiries submitted on their profile satisfy tb_enquiry's foreign key
   * and can genuinely be seen by logging into that supplier's dashboard.
   * Not a real business — see the "demo.*@leadlink.test" account.
   */
  supplierAccountId: string;
  name: string;
  initials: string;
  category: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  description: string;
  /** Full street address — internal only, never shown to customers. */
  fullAddress: string;
  /** Suburb/city/postal code only — safe to show on the public profile. */
  publicArea: string;
  cellNo: string;
  /** Shown to customers instead of a phone number they could call. */
  businessHours: string;
  whatsappNumber: string; // digits only, international format, no "+"
  gradient: string; // tailwind gradient classes for the logo avatar
};

export const MOCK_SUPPLIERS: MockSupplier[] = [
  {
    slug: "bright-solar-solutions",
    supplierAccountId: "3b90e7aa-f2f1-436e-8bc2-5a76059f6c4e",
    name: "Bright Solar Solutions",
    initials: "BS",
    category: "Solar & Energy",
    rating: 4.9,
    reviews: 128,
    location: "Cape Town",
    verified: true,
    description:
      "Bright Solar Solutions designs and installs residential and commercial solar systems across the Western Cape. From load-shedding backup setups to full off-grid installations, our certified technicians handle everything from site assessment to municipal sign-off.",
    fullAddress: "14 Kloof Street, Gardens, Cape Town, 8001",
    publicArea: "Gardens, Cape Town, 8001",
    cellNo: "082 111 2233",
    businessHours: "Mon–Fri: 8am–5pm, Sat: 8am–1pm",
    whatsappNumber: "27821112233",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    slug: "apex-plumbing-co",
    supplierAccountId: "9b5a27e9-eaef-4ad3-b701-bc7517dd89c8",
    name: "Apex Plumbing Co.",
    initials: "AP",
    category: "Plumbing",
    rating: 4.8,
    reviews: 94,
    location: "Johannesburg",
    verified: true,
    description:
      "24/7 emergency plumbing, geyser repairs and replacements, and full bathroom renovations. Apex Plumbing Co. has served Johannesburg homes and businesses for over a decade, with a satisfaction guarantee on every callout.",
    fullAddress: "56 Bree Street, Johannesburg CBD, 2001",
    publicArea: "Johannesburg CBD, 2001",
    cellNo: "083 222 3344",
    businessHours: "24/7 for emergencies, office hours Mon–Fri: 7am–6pm",
    whatsappNumber: "27832223344",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    slug: "lumen-electrical",
    supplierAccountId: "f6235fec-c961-4e06-94b5-ddd9fb95988e",
    name: "Lumen Electrical",
    initials: "LE",
    category: "Electrical",
    rating: 4.9,
    reviews: 76,
    location: "Durban",
    verified: true,
    description:
      "Lumen Electrical is a registered electrical contractor offering Certificate of Compliance (CoC) inspections, rewiring, fault-finding, and backup power installations for homes and small businesses in and around Durban.",
    fullAddress: "21 Florida Road, Morningside, Durban, 4001",
    publicArea: "Morningside, Durban, 4001",
    cellNo: "084 333 4455",
    businessHours: "Mon–Fri: 7:30am–5pm",
    whatsappNumber: "27843334455",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    slug: "greenleaf-landscaping",
    supplierAccountId: "2e0b2971-6856-411a-86b6-39710d0e1332",
    name: "GreenLeaf Landscaping",
    initials: "GL",
    category: "Landscaping",
    rating: 4.7,
    reviews: 58,
    location: "Pretoria",
    verified: true,
    description:
      "From full garden redesigns to ongoing lawn and irrigation maintenance, GreenLeaf Landscaping helps Pretoria homeowners and estates keep their outdoor spaces looking their best year-round.",
    fullAddress: "9 Lynnwood Road, Brooklyn, Pretoria, 0181",
    publicArea: "Brooklyn, Pretoria, 0181",
    cellNo: "071 444 5566",
    businessHours: "Mon–Sat: 7am–4pm",
    whatsappNumber: "27714445566",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    slug: "coastal-appliance-repairs",
    supplierAccountId: "cbebb058-73a7-4a96-bdad-dc5fbac14e1e",
    name: "Coastal Appliance Repairs",
    initials: "CA",
    category: "Appliance Repair",
    rating: 4.6,
    reviews: 41,
    location: "Port Elizabeth",
    verified: false,
    description:
      "Fridge, washing machine, and stove repairs with same-day callouts across Port Elizabeth. Coastal Appliance Repairs is currently completing verification with LeadLink.",
    fullAddress: "3 Cape Road, Mill Park, Port Elizabeth, 6001",
    publicArea: "Mill Park, Port Elizabeth, 6001",
    cellNo: "079 555 6677",
    businessHours: "Mon–Fri: 8am–5pm",
    whatsappNumber: "27795556677",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    slug: "sunrise-power-systems",
    supplierAccountId: "f0066b7f-e869-4655-b4c6-7ea9246daf91",
    name: "Sunrise Power Systems",
    initials: "SP",
    category: "Solar & Energy",
    rating: 4.8,
    reviews: 65,
    location: "Johannesburg",
    verified: true,
    description:
      "Sunrise Power Systems specializes in solar installation and backup power for homes and businesses across Johannesburg, with flexible financing options.",
    fullAddress: "88 Rivonia Road, Sandton, Johannesburg, 2196",
    publicArea: "Sandton, Johannesburg, 2196",
    cellNo: "081 222 9911",
    businessHours: "Mon–Fri: 8am–5pm, Sat: 9am–1pm",
    whatsappNumber: "27812229911",
    gradient: "from-yellow-500 to-amber-500",
  },
  {
    slug: "flowmaster-plumbing",
    supplierAccountId: "ea556a4d-8cde-4fe4-a23e-588d9429f836",
    name: "FlowMaster Plumbing",
    initials: "FP",
    category: "Plumbing",
    rating: 4.7,
    reviews: 52,
    location: "Cape Town",
    verified: true,
    description:
      "FlowMaster Plumbing handles residential and commercial plumbing, drain clearing, and geyser installations across Cape Town, with a focus on fast response times.",
    fullAddress: "5 Long Street, Cape Town CBD, 8001",
    publicArea: "Cape Town CBD, 8001",
    cellNo: "082 333 8822",
    businessHours: "24/7 for emergencies, office hours Mon–Fri: 8am–5pm",
    whatsappNumber: "27823338822",
    gradient: "from-cyan-500 to-sky-600",
  },
  {
    slug: "sparktech-electrical",
    supplierAccountId: "1e01ae7e-990c-440c-9e00-50d691f7dab9",
    name: "SparkTech Electrical",
    initials: "ST",
    category: "Electrical",
    rating: 4.8,
    reviews: 39,
    location: "Pretoria",
    verified: true,
    description:
      "SparkTech Electrical offers certified electrical contracting, CoC inspections, and solar-ready wiring for homes and businesses in Pretoria.",
    fullAddress: "17 Church Street, Hatfield, Pretoria, 0083",
    publicArea: "Hatfield, Pretoria, 0083",
    cellNo: "083 444 7733",
    businessHours: "Mon–Fri: 7:30am–5:30pm",
    whatsappNumber: "27834447733",
    gradient: "from-purple-500 to-fuchsia-500",
  },
  {
    slug: "fresh-coat-painters",
    supplierAccountId: "827f0937-33c4-470c-bc9e-2c759ad8ef7d",
    name: "Fresh Coat Painters",
    initials: "FC",
    category: "Painting & Renovations",
    rating: 4.7,
    reviews: 33,
    location: "Durban",
    verified: true,
    description:
      "Fresh Coat Painters brings a decade of experience in interior and exterior painting, waterproofing, and renovation touch-ups across Durban.",
    fullAddress: "42 Musgrave Road, Berea, Durban, 4001",
    publicArea: "Berea, Durban, 4001",
    cellNo: "084 555 6644",
    businessHours: "Mon–Sat: 8am–5pm",
    whatsappNumber: "27845556644",
    gradient: "from-rose-500 to-pink-600",
  },
];

export function getSupplierBySlug(slug: string): MockSupplier | undefined {
  return MOCK_SUPPLIERS.find((s) => s.slug === slug);
}

/**
 * Suppliers grouped by category, verified-only (matches real product
 * behavior — an unverified supplier shouldn't be publicly browsable yet,
 * even though their direct profile link still works). Categories with no
 * verified suppliers are omitted so the browse page never shows an empty
 * row. Order is stable (first-seen order in MOCK_SUPPLIERS).
 */
export function groupSuppliersByCategory(): { category: string; suppliers: MockSupplier[] }[] {
  const verified = MOCK_SUPPLIERS.filter((s) => s.verified);
  const order: string[] = [];
  const byCategory = new Map<string, MockSupplier[]>();
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
export function getFeaturedSuppliers(count = 6): MockSupplier[] {
  return [...MOCK_SUPPLIERS]
    .filter((s) => s.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}

/** Deterministic placeholder product photos per supplier (picsum.photos). */
export function mockProductImages(slug: string, count = 4): string[] {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${slug}-${i}/480/360`);
}
