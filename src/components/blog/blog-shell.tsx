import type { ReactNode } from "react";
import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export function BlogShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background"><Navbar /><main>{children}</main><Footer /></div>;
}
export function BlogNotFound() {
  return <BlogShell><div className="mx-auto max-w-3xl px-6 py-28 text-center"><h1 className="text-3xl font-bold">Post not found</h1><p className="my-5 text-muted-foreground">This article isn’t available. Explore our latest stories instead.</p><Button asChild><Link to="/blog">Back to all posts</Link></Button></div></BlogShell>;
}
export function BlogError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  const queryBoundary = useQueryErrorResetBoundary();
  return <BlogShell><div role="alert" className="px-6 py-28 text-center"><h1 className="text-3xl font-bold">The blog couldn’t load</h1><p className="my-5 text-muted-foreground">Please try again in a moment.</p><Button onClick={() => { queryBoundary.reset(); void router.invalidate(); reset(); }}>Try again</Button></div></BlogShell>;
}
export function BlogSkeleton() {
  return <BlogShell><div className="mx-auto max-w-7xl space-y-8 px-6 py-16" aria-label="Loading blog" role="status"><div className="h-12 w-2/3 animate-pulse rounded-md bg-muted" /><div className="h-80 animate-pulse rounded-lg bg-muted" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(n => <div key={n} className="h-72 animate-pulse rounded-lg bg-muted" />)}</div></div></BlogShell>;
}