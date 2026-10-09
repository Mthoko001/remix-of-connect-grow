/** South African provinces with their short display codes. */
export const PROVINCES = [
  { name: "Eastern Cape", code: "EC" },
  { name: "Free State", code: "FS" },
  { name: "Gauteng", code: "GP" },
  { name: "KwaZulu-Natal", code: "KZN" },
  { name: "Limpopo", code: "LP" },
  { name: "Mpumalanga", code: "MP" },
  { name: "North West", code: "NW" },
  { name: "Northern Cape", code: "NC" },
  { name: "Western Cape", code: "WC" },
] as const;

export type LocationParts = {
  province?: string | null | undefined;
  city?: string | null | undefined;
  suburb?: string | null | undefined;
  postalCode?: string | null | undefined;
  streetAddress?: string | null | undefined;
};

const clean = (v?: string | null) => (v ?? "").trim();

export function provinceCode(province?: string | null): string {
  const p = clean(province);
  return PROVINCES.find((x) => x.name.toLowerCase() === p.toLowerCase())?.code ?? p;
}

/**
 * Short location for cards and search results: "Suburb, City, KZN".
 * Province only → "KwaZulu-Natal, South Africa". Nothing → "".
 */
export function formatShortLocation(loc: LocationParts): string {
  const suburb = clean(loc.suburb);
  const city = clean(loc.city);
  const province = clean(loc.province);
  if (!suburb && !city) return province ? `${province}, South Africa` : "";
  const parts = [suburb, city].filter(Boolean);
  if (suburb && city && suburb.toLowerCase() === city.toLowerCase()) parts.pop();
  if (province) parts.push(provinceCode(province));
  return parts.join(", ");
}

/** Full business address for the profile page; "" when no street address was given. */
export function formatFullAddress(loc: LocationParts): string {
  const street = clean(loc.streetAddress);
  if (!street) return "";
  return [street, clean(loc.suburb), clean(loc.city), clean(loc.province), clean(loc.postalCode)]
    .filter(Boolean)
    .join(", ");
}

/** Public location: "City, Province" (full province name). Never includes street or suburb. */
export function formatCityProvince(loc: { city?: string | null | undefined; province?: string | null | undefined }): string {
  const city = clean(loc.city).replace(/\s+(metropolitan\s+|local\s+|district\s+)?municipality$/i, "");
  return [city, clean(loc.province)].filter(Boolean).join(", ");
}
