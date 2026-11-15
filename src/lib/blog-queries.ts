import { queryOptions } from "@tanstack/react-query";
import { fetchBlogPost, fetchBlogPosts } from "./blog.functions";

export const blogQuery = queryOptions({ queryKey: ["public-blog"], queryFn: () => fetchBlogPosts(), staleTime: 0 });
export const blogPostQuery = (slug: string) => queryOptions({ queryKey: ["public-blog", slug], queryFn: () => fetchBlogPost({ data: { slug } }), staleTime: 0 });