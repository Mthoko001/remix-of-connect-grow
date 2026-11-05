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
import plumbing from "@/assets/covers/cover-plumbing.jpg.asset.json";
import salon from "@/assets/covers/cover-salon.jpg.asset.json";
import restaurant from "@/assets/covers/cover-restaurant.jpg.asset.json";
import catering from "@/assets/covers/cover-catering.jpg.asset.json";
import auto from "@/assets/covers/cover-auto.jpg.asset.json";
import gardening from "@/assets/covers/cover-gardening.jpg.asset.json";
import realestate from "@/assets/covers/cover-realestate.jpg.asset.json";
import photography from "@/assets/covers/cover-photography.jpg.asset.json";
import business from "@/assets/covers/cover-business.jpg.asset.json";

export const SITE_URL = "https://growmeonline.co.za";

/** Keyword → cover, first match wins. */
const RULES: [RegExp, string][] = [
  // Specific industries first
  [/plumb/i, plumbing.url],
  [/hair|salon|barber|beauty|nail/i, salon.url],
  [/cater/i, catering.url],
  [/restaurant|food|cafe|bakery|chef|takeaway/i, restaurant.url],
  [/auto|mechanic|motor|vehicle|panel ?beat|tyre/i, auto.url],
  [/garden|landscap|lawn/i, gardening.url],
  [/real ?estate|property|letting/i, realestate.url],
  [/photo|video/i, photography.url],
  // Broader category defaults
  [/agri|farm|natural|animal|produce/i, agriculture.url],
  [/construct|building|build|renovat/i, construction.url],
  [/electric|solar/i, electrical.url],
  [/market|media|music|audio/i, marketing.url],
  [/legal|law/i, legal.url],
  [/account|financ|consult|tax|bookkeep/i, accounting.url],
  [/clean|pest|household/i, cleaning.url],
  [/secur|guard/i, security.url],
  [/manufactur|factory/i, manufacturing.url],
  [/retail|shop|cosmet|styl|rental/i, retail.url],
  [/\bit\b|tech|program|comput|software|ai |ai$|information/i, tech.url],
];

/** Default category-based cover (relative CDN path). */
export function categoryCover(category?: string | null, ...extra: (string | null | undefined)[]): string {
  for (const c of [category, ...extra]) {
    const hit = c ? RULES.find(([re]) => re.test(c))?.[1] : undefined;
    if (hit) return hit;
  }
  return business.url; // Generic GrowMeOnline business image
}

export const absoluteUrl = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);
