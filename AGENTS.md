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
