import agriculture from "@/assets/covers/cover-agriculture.jpg.asset.json";
import construction from "@/assets/covers/cover-construction.jpg.asset.json";
import tech from "@/assets/covers/cover-tech.jpg.asset.json";
import marketing from "@/assets/covers/cover-marketing.jpg.asset.json";
import legal from "@/assets/covers/cover-legal.jpg.asset.json";
import accounting from "@/assets/covers/cover-accounting.jpg.asset.json";
import cleaning from "@/assets/covers/cover-cleaning.jpg.asset.json";
import security from "@/assets/covers/cover-security.jpg.asset.json";
import manufacturing from "@/assets/covers/cover-manufacturing.jpg.asset.json";
import retail from "@/assets/covers/cover-retail.jpg.asset.json";
import electrical from "@/assets/covers/cover-electrical.jpg.asset.json";
import business from "@/assets/covers/cover-business.jpg.asset.json";

export const SITE_URL = "https://growmeonline.co.za";

/** Keyword → cover, first match wins. */
const RULES: [RegExp, string][] = [
  [/agri|farm|natural|animal|produce/i, agriculture.url],
  [/construct|building|build|plumb/i, construction.url],
  [/electric|solar/i, electrical.url],
  [/market|photo|media|music|audio/i, marketing.url],
  [/legal|law/i, legal.url],
  [/account|financ|consult|tax/i, accounting.url],
  [/clean|pest|household/i, cleaning.url],
  [/secur/i, security.url],
  [/manufactur|factory|motor|vehicle/i, manufacturing.url],
  [/retail|shop|cosmet|styl|rental/i, retail.url],
  [/\bit\b|tech|program|comput|software|ai |ai$|information/i, tech.url],
];

/** Default category-based cover (relative CDN path). */
export function categoryCover(category?: string | null): string {
  const c = category ?? "";
  return RULES.find(([re]) => re.test(c))?.[1] ?? business.url;
}

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);
