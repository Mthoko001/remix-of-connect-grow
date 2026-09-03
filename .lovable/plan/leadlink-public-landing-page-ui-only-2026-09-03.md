# LeadLink — Public Landing Page (UI only)

Build the public landing page for LeadLink. No backend, no Supabase, no auth — pure UI with placeholder navigation links. Structure inspired by the Revealbot website template (clean, modern SaaS landing: bold typography, generous whitespace, prominent hero, product-style visual, clear CTAs).

## Design direction

- Clean, modern, trustworthy marketplace feel — not a generic template.
- Distinctive palette (not default purple/indigo): a confident blue `--brand` (`oklch(0.54 0.18 254)`) with a `--brand-glow` gradient stop for primary CTAs, plus an emerald `--verified` token for the "verified" badges that signal trust.
- Font: **Plus Jakarta Sans** loaded via `<link>` in `__root.tsx`, registered as `--font-sans` in `src/styles.css` and applied to `body`.
- Fully responsive (375 / 768 / 1280+). Mobile nav collapses to a hamburger toggle.
- All colors via semantic design tokens — no hardcoded `text-white`/`bg-black`.

## Files to change

**1. `src/styles.css`** — add tokens:
- `:root` + `.dark`: `--brand`, `--brand-foreground`, `--brand-glow`, `--verified`.
- `@theme inline`: map `--color-brand`, `--color-brand-foreground`, `--color-brand-glow`, `--color-verified`, plus `--font-sans` / `--font-display`.
- `@layer base`: set `body { font-family: var(--font-sans); }`.

**2. `src/routes/__root.tsx`** — update `head()`:
- Replace placeholder "Lovable App" title/description/og with LeadLink equivalents.
- Add Google Fonts `<link>` (Plus Jakarta Sans) + preconnect.

**3. New components under `src/components/landing/`:**
- `logo.tsx` — LeadLink wordmark (link icon + "Lead**Link**"), reused in nav + footer.
- `navbar.tsx` — sticky blurred top bar. Left: logo. Center (desktop): How It Works, Categories, Pricing, About Us. Right: "Log In" text link + dominant gradient "List My Business" button. Mobile: hamburger toggle revealing stacked links + CTAs.
- `hero.tsx` — headline focused on customers finding trusted local suppliers, supporting subheadline, two side-by-side CTAs (primary "List My Business" → `/supplier/signup`, secondary "Find a Supplier" → `/search`). Hero visual: a stylized product-style card (browser bar + verified supplier rows + floating "New enquiry received" badge).
- `how-it-works.tsx` — 3-step strip (List your business → Get verified → Get enquiries), horizontal on desktop, stacked on mobile, with connector arrows.
- `featured-listings.tsx` — 4 static mock supplier cards (initials avatar, name, category, star rating, review count, location, verified badge).
- `about.tsx` — mission paragraph + 3 stat tiles (verified suppliers / enquiries sent / avg rating).
- `footer.tsx` — logo + tagline, quick links (About, Categories, Contact, Terms, Privacy), social icon placeholders, copyright.

**4. `src/routes/index.tsx`** — replace the placeholder with the assembled `LandingPage` (Navbar → Hero → HowItWorks → FeaturedListings → About → Footer) and its own `head()` metadata.

## CTA behaviour

- "List My Business" is the visually dominant CTA everywhere (gradient `from-brand to-brand-glow`, shadow, hover lift) — appears in nav, hero, about, footer.
- "Log In" → `/login`, "Find a Supplier" → `/search`, "List My Business" → `/supplier/signup`.
- In-page nav ("How It Works", "About Us") uses hash anchors (`#how-it-works`, `#about`) for scroll.
- Placeholder paths (`/supplier/signup`, `/search`, `/login`, `/categories`, `/pricing`, `/contact`, `/terms`, `/privacy`) use plain `<a href>` because the route files don't exist yet — using `<Link to>` would fail TanStack's type-safe routing. **Assumption flagged:** these will be swapped to `<Link>` once those routes are built in later prompts. Only `/` (logo) uses `<Link>` since the home route exists.

## Acceptance criteria

- [ ] Nav, hero, how-it-works, featured listings, about, footer all present
- [ ] "List My Business" is the visually dominant CTA
- [ ] All CTAs route to the correct placeholder paths
- [ ] Responsive at 375px, 768px, 1280px+
- [ ] No backend calls, no Supabase client used

## Assumptions to flag

- Placeholder CTAs use `<a href>` (not `<Link>`) to avoid type-safe-link build errors until target routes exist.
- Mock supplier data and stats are static/hardcoded placeholders, not real data.
- No actual pages built for `/supplier/signup`, `/search`, `/login`, etc.
