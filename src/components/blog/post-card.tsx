import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { blogDate, readTime, type BlogPost } from "@/lib/blog";

export function PostMeta({ post }: { post: BlogPost }) {
  return <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
    <time dateTime={post.published_at ?? undefined}>{blogDate(post.published_at)}</time>
    <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" aria-hidden="true" />{readTime(post.content)} min read</span>
  </div>;
}
export function PostCard({ post }: { post: BlogPost }) {
  return <Link to="/blog/$slug" params={{ slug: post.slug }} className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    {post.cover_image && <img src={post.cover_image} alt={post.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />}
    <div className="flex flex-1 flex-col p-6">
      <span className="mb-3 text-xs font-semibold text-brand">{post.category}</span>
      <h3 className="text-xl font-semibold leading-snug text-foreground group-hover:text-brand">{post.title}</h3>
      <p className="mb-6 mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
      <div className="mt-auto flex items-center justify-between gap-2"><PostMeta post={post} /><ArrowUpRight className="size-4 shrink-0 text-brand" aria-hidden="true" /></div>
    </div>
  </Link>;
}