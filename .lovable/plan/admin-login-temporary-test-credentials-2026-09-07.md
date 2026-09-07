# Admin login (temporary test credentials)

## Where things stand

I checked the project and the backend: there is **no admin work in this project at all**. Whatever was built elsewhere (in Claude) did not land here.

- Pages that exist: landing page, supplier sign-up, log in, forgot password, and the supplier dashboard pages.
- Database tables: supplier accounts and supplier profiles only — no admin or roles table.
- Accounts: one user exists, `seja.mthoko@gmail.com`.

So admin login needs to be built from scratch. Below is the smallest safe version you can test today and throw away later.

## What I'll build

1. **A roles table** (separate from the supplier tables, for security) that records which accounts are admins.
2. **An admin log-in page at `/admin/login`** — same clean card design as the existing log-in page, email + password, one generic "Incorrect email or password." error, loading state. After a successful sign-in it checks the account really is an admin; if not, it signs them straight back out and says the account has no admin access.
3. **A protected admin area at `/admin`** with a simple sidebar shell and a placeholder overview page (a heading, a few zero-state cards). Non-admins and signed-out visitors are sent to `/admin/login`.
4. **A temporary admin account** so you can test immediately:
   - Admin: `admin@leadlink.test`, password `Admin123!`
   - I'll create it confirmed (no email link needed) and mark it as an admin.
   - This is throwaway — say the word later and I'll remove it and grant admin to your real address instead.

I'll leave the supplier sign-up, log-in and dashboard flows untouched.

## Assumptions

- Only one admin level for now (no "super admin" vs "moderator").
- The admin area is UI shell only in this step — reviewing and verifying suppliers comes in a later prompt.
- Admins use their own log-in page rather than sharing `/login`, so supplier and admin journeys stay separate.

## Technical detail

- Migration: `app_role` enum (`admin`, `moderator`, `user`), `public.tb_user_role` (`user_role_id` uuid PK, `user_id` uuid FK → `auth.users`, `role app_role`, unique on `(user_id, role)`), GRANTs for `authenticated` / `service_role`, RLS on, plus a `SECURITY DEFINER` `public.has_role(_user_id uuid, _role app_role)` function. Users may read their own role rows; no client-side writes.
- The temporary admin user is created through the Auth Admin API (not by writing to `auth.users`), then given an `admin` row in `tb_user_role`.
- New files: `src/hooks/use-admin-session.ts` (session + `has_role` check via RPC), `src/components/admin/admin-shell.tsx`, `src/routes/admin/login.tsx`, `src/routes/admin/dashboard.tsx`. Route-level guards redirect to `/admin/login`; every future admin data read will still be gated server-side by RLS through `has_role`, never by the UI alone.
