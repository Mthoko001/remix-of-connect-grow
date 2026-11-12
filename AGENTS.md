<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Free-enquiry quota (5) is enforced by a BEFORE INSERT trigger on tb_enquiry; UI checks via can_supplier_receive_enquiries are UX only. Why: the database is the only place customers cannot bypass.
- Render supplier/company logos through the shared 80px CompanyLogo component; keep product photos on cover-fit media components. Why: logos must remain uncropped and proportional everywhere.
- Public supplier gallery thumbnails are uniform 4:3 cover-cropped cards; the shared full-screen lightbox shows each image uncropped (contain). Why: grid looks consistent while full images stay viewable in place.
- Subscriptions become 'paid' only in the signature-verified Yoco webhook (src/routes/api/public/yoco-webhook.ts); suppliers cannot insert subscription rows. Why: payment status must never rely on frontend logic.
- Customer enquiries are saved through the createEnquiry server function, which then forwards them to Chatwoot best-effort. Why: Chatwoot credentials stay server-side and a Chatwoot outage never loses an enquiry.
- Public supplier DTOs omit website fields and allow only recognized social-network URLs; supplier autosaves omit website writes while admin editors retain them. Why: administrative website data must not leak through public profiles or be overwritten by hidden supplier inputs.
- Public supplier pages read the tb_public_supplier_listing view, never tb_supplier_profile directly; any new profile column shown to customers must be added to that view and to both select lists in src/lib/public-suppliers.functions.ts. Why: a column missing from the view stays invisible to customers no matter what the database holds.
