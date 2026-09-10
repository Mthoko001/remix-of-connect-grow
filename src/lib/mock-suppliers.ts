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
  address: string;
  cellNo: string;
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
    address: "14 Kloof Street, Gardens, Cape Town, 8001",
    cellNo: "082 111 2233",
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
    address: "56 Bree Street, Johannesburg CBD, 2001",
    cellNo: "083 222 3344",
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
    address: "21 Florida Road, Morningside, Durban, 4001",
    cellNo: "084 333 4455",
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
    address: "9 Lynnwood Road, Brooklyn, Pretoria, 0181",
    cellNo: "071 444 5566",
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
    address: "3 Cape Road, Mill Park, Port Elizabeth, 6001",
    cellNo: "079 555 6677",
    whatsappNumber: "27795556677",
    gradient: "from-sky-500 to-blue-600",
  },
];

export function getSupplierBySlug(slug: string): MockSupplier | undefined {
  return MOCK_SUPPLIERS.find((s) => s.slug === slug);
}

/** Deterministic placeholder product photos per supplier (picsum.photos). */
export function mockProductImages(slug: string, count = 4): string[] {
  return Array.from({ length: count }, (_, i) => `https://picsum.photos/seed/${slug}-${i}/480/360`);
}
