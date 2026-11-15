import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogShell, BlogError, BlogNotFound, BlogSkeleton } from "@/components/blog/blog-shell";
import { PostCard, PostMeta } from "@/components/blog/post-card";
import { blogPostQuery, blogQuery } from "@/lib/blog-queries";
import { relatedPosts } from "@/lib/blog";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const [post] = await Promise.all([
      context.queryClient.ensureQueryData(blogPostQuery(params.slug)),
      context.queryClient.ensureQueryData(blogQuery),
    ]);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData: post, params }) => {
    const title = post
      ? `${post.title} | GrowMeOnline Blog`
      : "Article unavailable | GrowMeOnline Blog";
    const description = post?.excerpt ?? "Explore the latest GrowMeOnline articles.";
    const url = `https://growmeonline.co.za/blog/${encodeURIComponent(params.slug)}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(post?.cover_image?.startsWith("https://")
          ? [
              { property: "og:image", content: post.cover_image },
              { name: "twitter:image", content: post.cover_image },
            ]
          : []),
        ...(!post ? [{ name: "robots", content: "noindex" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: BlogArticle,
  errorComponent: BlogError,
  notFoundComponent: BlogNotFound,
  pendingComponent: BlogSkeleton,
  pendingMs: 100,
});
function BlogArticle() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(blogPostQuery(slug));
  const { data: posts } = useSuspenseQuery(blogQuery);
  if (!post) return <BlogNotFound />;
  const related = relatedPosts(posts, post);
  return (
    <BlogShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap gap-2 text-sm text-muted-foreground"
        >
          <Link to="/blog" className="hover:text-brand">
            Blog
          </Link>
          <span aria-hidden="true">/</span>
          <Link to="/blog" search={{ category: post.category }} className="hover:text-brand">
            {post.category}
          </Link>
        </nav>
        <header className="mx-auto mb-9 max-w-[700px]">
          <span className="rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {post.category}
          </span>
          <h1 className="mb-6 mt-5 text-3xl font-bold leading-tight sm:text-5xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">By {post.author_name}</span>
            <PostMeta post={post} />
          </div>
        </header>
        {post.cover_image && (
          <img
            src={post.cover_image}
            alt={post.title}
            className="mb-12 aspect-[1200/630] w-full rounded-lg object-cover"
            fetchPriority="high"
          />
        )}
        <article className="blog-prose mx-auto max-w-[700px]">
          <ReactMarkdown
            skipHtml
            rehypePlugins={[rehypeSanitize]}
            components={{
              h1: ({ children }) => <h2>{children}</h2>,
              img: ({ src, alt }) => <img src={src} alt={alt || post.title} loading="lazy" />,
              a: ({ href, children }) => (
                <a href={href} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
        <section className="mx-auto my-14 max-w-[700px] rounded-lg border border-brand/20 bg-brand/5 p-6 sm:p-9">
          <h2 className="text-2xl font-bold">Ready to grow your business?</h2>
          <p className="mb-6 mt-3 leading-relaxed text-muted-foreground">
            Create your business profile and connect with customers looking for what you offer.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
              <Link to="/supplier/signup">
                List My Business
                <ArrowRight />
              </Link>
            </Button>
            <Link to="/search" className="text-sm font-semibold text-brand hover:underline">
              Find a Supplier
            </Link>
          </div>
        </section>
        {related.length > 0 && (
          <section className="border-t border-border pt-10">
            <h2 className="mb-6 text-2xl font-bold">Related posts</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.blog_post_id} post={p} />
              ))}
            </div>
          </section>
        )}
        <Link
          to="/blog"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to all posts
        </Link>
      </div>
    </BlogShell>
  );
}
