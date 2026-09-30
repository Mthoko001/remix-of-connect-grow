// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: process.platform === "win32" ? [] : [mcpPlugin()],
    // Fallback for publish builds that lack injected env: these are public (publishable) values.
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        process.env['VITE_SUPABASE_URL'] || "https://vjhfmhjsgrkzeupoafcn.supabase.co",
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] || "sb_publishable_jedDgTKY5hwkAYV-_IqLFw_q8h7_kSo",
      ),
      "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
        process.env['VITE_SUPABASE_PROJECT_ID'] || "vjhfmhjsgrkzeupoafcn",
      ),
    },
  },
});
