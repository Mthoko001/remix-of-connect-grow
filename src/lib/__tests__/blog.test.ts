import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import { BLOG_LIMIT, readTime, relatedPosts, type BlogPost } from "../blog";

const post = (slug: string, category: string, date: string): BlogPost => ({
  blog_post_id: 1,
  slug,
  category,
  published_at: date,
  title: slug,
  excerpt: "Example",
  content: "Text",
  cover_image: null,
  author_name: "Team",
  status: "published",
  date_created: date,
  date_updated: date,
});
describe("blog rules", () => {
  it("limits the public list to 50 articles", () => expect(BLOG_LIMIT).toBe(50));
  it("uses 200 words per minute and at least one minute", () => {
    expect(readTime("")).toBe(1);
    expect(readTime("word ".repeat(200))).toBe(1);
    expect(readTime("word ".repeat(201))).toBe(2);
  });
  it("returns at most three others, preferring the same category then newest", () => {
    const current = post("current", "Suppliers", "2026-11-15");
    expect(
      relatedPosts(
        [
          current,
          post("new", "Customers", "2026-11-14"),
          post("same", "Suppliers", "2026-11-01"),
          post("old", "Customers", "2026-10-01"),
          post("last", "Customers", "2026-09-01"),
        ],
        current,
      ).map((p) => p.slug),
    ).toEqual(["same", "new", "old"]);
  });
  it("rejects raw HTML and script links in article Markdown", () => {
    const html = renderToStaticMarkup(
      createElement(ReactMarkdown, {
        skipHtml: true,
        rehypePlugins: [rehypeSanitize],
        children:
          "<script>alert(1)</script>\n\n[click](javascript:alert(1))\n\n<img src=x onerror=alert(1)>",
      }),
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onerror");
  });
});
