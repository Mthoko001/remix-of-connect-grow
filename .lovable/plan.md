# Finish the Qualified Lead Approval workflow

Most of this spec already works today. Customer enquiries start as Pending Review, and only an admin can approve or reject them. Suppliers only see leads an admin has approved, never pending or rejected ones. Only approved leads count toward a supplier's 5 free leads. The admin KPI cards and the four emails are already in place. This plan closes the remaining gaps.

## Changes
1. **Status name:** show "Qualified" again everywhere: admin tabs, badges, the supplier dashboard and enquiry cards. The admin buttons become "Approve Lead" / "Reject Lead", and the page title becomes "Lead Qualification Queue". Edit, Archive and the audit trail stay as they are.
2. **Required Subject:** add a required Subject box to the customer enquiry form, up to 120 characters. Show the subject in:
   - the admin queue, as its own column
   - the review popup
   - the supplier's lead cards
   - the Chatwoot "NEW LEAD" message
   
   Admins can also correct the subject with Edit. Enquiries sent before this change will show "—".
3. **Customer confirmation:** after sending, the customer sees: "Thank you for your enquiry. Your enquiry has been received and is currently being reviewed by our team. Once approved, it will be forwarded to the supplier."
4. **Rejection reasons** become: Spam, Duplicate, Wrong Category, Wrong Supplier, Outside Service Area, Incomplete Information, Invalid Contact Details, Other. Past rejections keep showing their original reason.
5. **Supplier approval email** subject changes to "You Have a New Qualified Lead".
6. **Admin KPI cards:** keep Pending Review, Qualified, Rejected and Qualification Rate (qualified ÷ total submitted). Total Leads Submitted also stays.

## Technical details
- Migration: add a `subject text` column to `tb_enquiry`, allowed to be empty so older enquiries still fit.
  - Update `review_enquiry` to accept the new reason codes (`wrong_category`, `wrong_supplier`, `incomplete_information`, `invalid_contact_details`) and keep accepting the old ones.
  - Add `_subject` to `admin_edit_enquiry`, with the audit entry recording the previous subject.
- `createEnquiry` server function: the input check requires a subject of 1–120 characters, and the subject is saved and passed to Chatwoot.
- Files to change:
  - `in-app-enquiry-dialog.tsx`
  - `enquiries.ts`
  - `enquiries.functions.ts`
  - `chatwoot.server.ts`
  - `lead-review.ts` (labels, reasons, edit)
  - `admin-enquiries.ts`
  - `admin/enquiries.tsx`
  - `admin-shell.tsx`
  - `supplier/enquiries.tsx`
  - `lead-status.tsx`
  - `lead-qualified.tsx` (email subject)
- Add tests for the quota rule (only qualified-type statuses count) and for the subject being required.
