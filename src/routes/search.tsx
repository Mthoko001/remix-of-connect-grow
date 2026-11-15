import { createFileRoute, redirect } from "@tanstack/react-router";

// Public search alias; the supplier directory owns the existing search experience.
export const Route = createFileRoute("/search")({ beforeLoad: () => { throw redirect({ to: "/suppliers" }); } });