import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { BLOG_LIMIT } from "./blog";

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Blog connection is unavailable. Please try again shortly.");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
          headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
const columns =
  "blog_post_id,title,slug,excerpt,content,cover_image,category,status,published_at,author_name,date_created,date_updated";
export const fetchBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("tb_blog_post")
    .select(columns)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .order("blog_post_id", { ascending: false })
    .limit(BLOG_LIMIT);
  if (error) throw new Error("The blog could not load. Please try again.");
  return data ?? [];
});
export const fetchBlogPost = createServerFn({ method: "GET" })
  .inputValidator(z.object({ slug: z.string().min(1).max(200) }))
  .handler(async ({ data: input }) => {
    const { data, error } = await publicClient()
      .from("tb_blog_post")
      .select(columns)
      .eq("slug", input.slug)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .maybeSingle();
    if (error) throw new Error("The article could not load. Please try again.");
    return data;
  });
