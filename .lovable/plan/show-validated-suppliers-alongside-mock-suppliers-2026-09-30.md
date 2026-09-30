# Show validated suppliers alongside mock suppliers

## Current state (checked)
- The Suppliers page already merges mock suppliers with live ones from a "validated suppliers" list, and each live supplier opens its own profile page.
- Right now there are no supplier profiles in the database at all, so nothing live appears yet. Once an admin validates a profile, it will show.
- Live suppliers currently appear without their logo or photos (their files are stored privately), and always after the mock ones.
- The home-page "Featured Suppliers" strip only uses mock suppliers.

## What I'll build
1. **Logos and photos for live suppliers** - show the uploaded business logo on cards and profile pages, and the product images in the profile gallery.
2. **Live suppliers listed first** in Featured and their category rows, so real businesses are easy to spot next to the mock ones.
3. **Home-page Featured Suppliers** also includes validated suppliers (mock ones fill the remaining spots).
4. **Easy mock removal** - all mock data stays behind a single switch, so later you can delete it in one place and only real suppliers remain.
5. **Test** - validate a test profile as admin and confirm it appears on the Suppliers page, in search, and on its profile page with the "Verified" badge.

## Assumptions
- Only profiles with status "validated" are public; drafts and rejected stay hidden. Payment status is not checked (say if only paid suppliers should show).
- Live suppliers show "New on LeadLink" until reviews exist.
- Street address stays private; only the suburb/city part is shown.
- Live profile pages will not show a WhatsApp/phone number yet; enquiries go through the in-app enquiry form.

## Technical details
- Migration: extend view `tb_public_supplier_listing` with `business_logo` and `product_images` (added as trailing columns, non-breaking); keep anon/authenticated SELECT.
- `src/lib/public-suppliers.functions.ts`: select the new columns, create 1-hour signed URLs server-side (admin client loaded inside the handler, only for rows already in the validated view), map to `logoUrl` / `productImages`.
- `src/routes/suppliers/index.tsx`: order `[...liveSuppliers, ...MOCK_SUPPLIERS]`.
- `src/components/landing/featured-listings.tsx`: load live suppliers via the same server function (route loader on `/`), merge with mocks.
- `src/routes/suppliers/$slug.tsx`: "More suppliers" pulls from live + mock.
