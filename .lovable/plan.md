# Update README with High-Level Process Flows

## Goal
Rewrite the `README.md` process-flow documentation so the GitHub repo shows, at a glance, how each actor moves through GrowMeOnline: Customer, Supplier, System (backend), Admin, and the Notifications (emails) that fire along the way. Documentation only — no app code, database, or behaviour changes.

## What changes in README.md

1. **Replace the single "Supplier Workflow" mermaid diagram** with a set of focused, accurate diagrams (mermaid, renders natively on GitHub):
   - **Customer journey** — browse listings/categories → view supplier profile → submit enquiry (in-app form) → see "under review by our team" message → receive decision email → supplier responds.
   - **Supplier journey** — sign up (email/password; Google placeholder) → verify email → create business profile (autosave draft) → submit for review → wait for admin decision → if rejected: edit & resubmit; if approved: choose package → Yoco checkout → subscription active → receive qualified leads → manage leads (in progress / closed) → renew before expiry.
   - **Admin workflow** — review submitted profiles (approve/reject with reason) → review lead queue (approve/reject with reason; spam etc.) → manage packages, subscriptions, categories, audit log.
   - **System / data flow** — enquiry path: Form → GrowMeOnline database (status `pending_review`, quota trigger enforced in DB) → best-effort forward to Chatwoot "Growmeonline leads" inbox → admin review → qualified lead released to supplier. Note DB is the quota authority; Chatwoot/email failures never block an enquiry.
   - **Lead qualification & quota** — statuses (Pending Review → Qualified/Rejected → In Progress → Closed); only Qualified leads count toward the 5 free leads; exhausted quota blocks new enquiries until subscription.
   - **Payments** — package selection → Yoco hosted page → signature-verified webhook activates subscription (renewing extends expiry) → expired state blocks new leads but keeps profile listed.
   - **Notifications map** — a table or small diagram listing each email and its trigger:
     - Profile submitted (to supplier), Profile approved / rejected (to supplier)
     - Enquiry received (to customer), New enquiry pending review (to admins), New qualified lead (to supplier), Enquiry update / rejected (to customer)
     - Subscription activated / payment unsuccessful (to supplier)
     - Plus auth emails: signup confirmation, password recovery, email change.
   - **Status legend** — one small table of supplier profile statuses (draft → pending verification → validated / rejected) and lead statuses, so diagram labels have one place to decode.

2. **Keep** everything else in the README intact: overview, branch structure, features list, application structure, routes table, tech stack, setup, scripts, data-model notes, contributing.

3. **Accuracy ground rules** — diagrams reflect only what's implemented today; mark known-not-built items (expiry reminder emails, Yoco live activation pending merchant account) with a short "Coming next" note rather than drawing them as live.

## Verification
- Render check: confirm each mermaid block parses (GitHub-compatible syntax, no emojis inside node labels).
- Cross-check every arrow against the actual code paths (enquiry server function, lead review DB function, Yoco webhook, profile review service) so no flow is aspirational.
- Commit goes to the connected GitHub repo automatically via Lovable sync.

## Assumptions (flagged)
- "and more" = the extra sections above (system flow, quota, payments, notification map, status legend). If you want anything else included — e.g. profile-view analytics flow — say so and I'll add a section.
- English, same tone as the current README.
