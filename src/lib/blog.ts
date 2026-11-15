import type { Database } from "@/integrations/supabase/types";

export type BlogPost = Database["public"]["Tables"]["tb_blog_post"]["Row"];
export const BLOG_LIMIT = 50;
export function readTime(content: string): number {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));
}
export function relatedPosts(posts: BlogPost[], current: BlogPost): BlogPost[] {
  return posts
    .filter((post) => post.slug !== current.slug)
    .sort(
      (a, b) =>
        Number(b.category === current.category) - Number(a.category === current.category) ||
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    )
    .slice(0, 3);
}
export function blogDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(value))
    : "";
}
