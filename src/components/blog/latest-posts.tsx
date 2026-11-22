import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PostCard } from "./post-card";
import type { BlogPost } from "@/lib/blog";

export function LatestPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm font-semibold text-brand">Ideas for your next step</p>
            <h2 className="text-3xl font-bold">Latest from the blog</h2>
          </div>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            View all posts
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.blog_post_id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
