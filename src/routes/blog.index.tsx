import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogShell, BlogError, BlogNotFound, BlogSkeleton } from "@/components/blog/blog-shell";
import { PostCard, PostMeta } from "@/components/blog/post-card";
import { blogQuery } from "@/lib/blog-queries";

const title = "The GrowMeOnline Blog | GrowMeOnline";
const description =
  "Practical guides for South African businesses to get more enquiries, build stronger profiles, and help customers find trustworthy suppliers.";
export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined } => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(blogQuery),
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://growmeonline.co.za/blog" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(loaderData?.[0]?.cover_image?.startsWith("https://")
        ? [
            { property: "og:image", content: loaderData[0].cover_image },
            { name: "twitter:image", content: loaderData[0].cover_image },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: "https://growmeonline.co.za/blog" }],
  }),
  component: BlogList,
  errorComponent: BlogError,
  notFoundComponent: BlogNotFound,
  pendingComponent: BlogSkeleton,
  pendingMs: 100,
});
function BlogList() {
  const { data: posts } = useSuspenseQuery(blogQuery);
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const categories = Array.from(new Set(posts.map((p) => p.category))).sort();
  const featured = posts[0];
  const filtered = category ? posts.filter((p) => p.category === category) : posts;
  return (
    <BlogShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold text-brand">Local knowledge. Shared growth.</p>
          <h1 className="text-4xl font-bold sm:text-5xl">The GrowMeOnline Blog</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Practical advice for growing your business and finding suppliers you can trust.
          </p>
        </header>
        {!featured ? (
          <p className="py-20 text-center text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <>
            <Link
              to="/blog/$slug"
              params={{ slug: featured.slug }}
              className="group relative mb-12 block min-h-96 overflow-hidden rounded-lg bg-primary text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {featured.cover_image && (
                <img
                  src={featured.cover_image}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  fetchPriority="high"
                />
              )}
              <div className="absolute inset-0 bg-primary/75" />
              <div className="relative flex min-h-96 max-w-3xl flex-col justify-end p-6 sm:p-10">
                <span className="mb-4 w-fit rounded-md bg-brand-glow px-3 py-1 text-xs font-semibold text-foreground">
                  {featured.category}
                </span>
                <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{featured.title}</h2>
                <p className="mb-6 mt-4 max-w-xl text-base leading-relaxed">{featured.excerpt}</p>
                <div className="[&_*]:text-primary-foreground">
                  <PostMeta post={featured} />
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                  Read the story
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
            <nav aria-label="Blog categories" className="mb-8 flex flex-wrap gap-2">
              {["All", ...categories].map((c) => (
                <Button
                  key={c}
                  variant={(category ?? "All") === c ? "default" : "outline"}
                  aria-pressed={(category ?? "All") === c}
                  onClick={() =>
                    void navigate({ search: { category: c === "All" ? undefined : c } })
                  }
                >
                  {c}
                </Button>
              ))}
            </nav>
            {filtered.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((post) => (
                  <PostCard key={post.blog_post_id} post={post} />
                ))}
              </div>
            ) : (
              <p className="py-16 text-center text-muted-foreground">
                No posts in this category yet.
              </p>
            )}
          </>
        )}
      </div>
    </BlogShell>
  );
}
