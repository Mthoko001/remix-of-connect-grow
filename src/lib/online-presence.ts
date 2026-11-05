/** Website and social-media link helpers for supplier profiles. */

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "x" | "youtube" | "tiktok" | "other";

/** Adds https:// when missing and returns a valid http(s) URL, or null if invalid/empty. */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!/^[^\s.]+(\.[^\s.]+)+$/.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Normalizes a list of links, dropping empty entries. Returns invalid raw inputs separately. */
export function normalizeLinks(inputs: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const i of inputs) {
    if (!i.trim()) continue;
    const n = normalizeUrl(i);
    if (n) {
      if (!valid.includes(n)) valid.push(n);
    } else invalid.push(i);
  }
  return { valid, invalid };
}

export function detectPlatform(url: string): SocialPlatform {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "other";
  }
  const matches = (domain: string) => host === domain || host.endsWith(`.${domain}`);
  if (matches("facebook.com") || host === "fb.com") return "facebook";
  if (matches("instagram.com")) return "instagram";
  if (matches("linkedin.com")) return "linkedin";
  if (matches("x.com") || matches("twitter.com")) return "x";
  if (matches("youtube.com") || host === "youtu.be") return "youtube";
  if (matches("tiktok.com")) return "tiktok";
  return "other";
}

/** Public social links must never become a substitute for supplier website navigation. */
export function publicSocialLinks(value: unknown): string[] {
  return normalizeLinks(linksFromJson(value)).valid.filter((url) => detectPlatform(url) !== "other");
}

export const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  youtube: "YouTube",
  tiktok: "TikTok",
  other: "Website",
};

export function linksFromJson(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}
