ALTER TABLE public.tb_enquiry
  ADD COLUMN IF NOT EXISTS qualified_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_by_email text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejection_note text;

ALTER TABLE public.tb_enquiry DROP CONSTRAINT IF EXISTS tb_enquiry_status_check;
ALTER TABLE public.tb_enquiry ALTER COLUMN status SET DEFAULT 'pending_review';

-- Legacy rows pre-date admin review: treat them as already qualified.
UPDATE public.tb_enquiry SET qualified_at = created_at, reviewed_at = created_at WHERE status IN ('new','read','replied') AND qualified_at IS NULL;
UPDATE public.tb_enquiry SET status = 'qualified' WHERE status = 'new';
UPDATE public.tb_enquiry SET status = 'in_progress' WHERE status = 'read';
UPDATE public.tb_enquiry SET status = 'closed' WHERE status = 'replied';

ALTER TABLE public.tb_enquiry ADD CONSTRAINT tb_enquiry_status_check
  CHECK (status IN ('pending_review','qualified','rejected','in_progress','closed'));
ALTER TABLE public.tb_enquiry ADD CONSTRAINT tb_enquiry_rejection_reason_check
  CHECK (rejection_reason IS NULL OR rejection_reason IN ('spam','duplicate','incorrect_supplier','outside_service_area','invalid_contact_information','incomplete_enquiry','not_relevant','other'));

CREATE INDEX IF NOT EXISTS tb_enquiry_status_created_idx ON public.tb_enquiry (status, created_at DESC);

-- Policies: customers can only create pending enquiries; suppliers only see / touch released leads.
DROP POLICY IF EXISTS "Anyone can submit enquiries" ON public.tb_enquiry;
CREATE POLICY "Anyone can submit enquiries" ON public.tb_enquiry
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending_review');

DROP POLICY IF EXISTS "Suppliers and admins view enquiries" ON public.tb_enquiry;
CREATE POLICY "Suppliers view released leads, admins view all" ON public.tb_enquiry
  FOR SELECT TO authenticated
  USING ((auth.uid() = supplier_account_id AND status IN ('qualified','in_progress','closed')) OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Suppliers update own enquiries" ON public.tb_enquiry;
CREATE POLICY "Suppliers update own released leads" ON public.tb_enquiry
  FOR UPDATE TO authenticated
  USING (auth.uid() = supplier_account_id AND status IN ('qualified','in_progress','closed'))
  WITH CHECK (auth.uid() = supplier_account_id AND status IN ('qualified','in_progress','closed'));

-- Only the status column may be changed directly; review fields go through review_enquiry().
REVOKE UPDATE ON public.tb_enquiry FROM authenticated;
GRANT UPDATE (status) ON public.tb_enquiry TO authenticated;

-- Quota now counts released (qualified) leads only.
CREATE OR REPLACE FUNCTION public.can_supplier_receive_enquiries(_supplier_account_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT public.supplier_has_active_subscription(_supplier_account_id)
      OR (SELECT count(*) FROM public.tb_enquiry WHERE supplier_account_id = _supplier_account_id AND qualified_at IS NOT NULL) < 5
$function$;

CREATE OR REPLACE FUNCTION public.get_my_lead_status()
 RETURNS TABLE(total_enquiries integer, free_limit integer, has_active_subscription boolean, monetization_status text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  WITH s AS (
    SELECT (SELECT count(*)::int FROM public.tb_enquiry WHERE supplier_account_id = auth.uid() AND qualified_at IS NOT NULL) AS total,
           public.supplier_has_active_subscription(auth.uid()) AS active
  )
  SELECT total, 5, active, public.supplier_monetization_status(total, active) FROM s WHERE auth.uid() IS NOT NULL
$function$;

CREATE OR REPLACE FUNCTION public.admin_supplier_monetization()
 RETURNS TABLE(supplier_account_id uuid, total_enquiries integer, has_active_subscription boolean, monetization_status text)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT a.supplier_account_id, COALESCE(e.total, 0)::int,
         public.supplier_has_active_subscription(a.supplier_account_id),
         public.supplier_monetization_status(COALESCE(e.total, 0)::int, public.supplier_has_active_subscription(a.supplier_account_id))
  FROM public.tb_supplier_account a
  LEFT JOIN (SELECT supplier_account_id, count(*) AS total FROM public.tb_enquiry WHERE qualified_at IS NOT NULL GROUP BY 1) e
    ON e.supplier_account_id = a.supplier_account_id
  WHERE public.is_admin(auth.uid())
$function$;

-- Supplier lead summary by status (counts only; no pending lead content is exposed).
CREATE OR REPLACE FUNCTION public.get_my_lead_summary()
 RETURNS TABLE(pending_review integer, qualified integer, in_progress integer, closed integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT count(*) FILTER (WHERE status = 'pending_review')::int,
         count(*) FILTER (WHERE status = 'qualified')::int,
         count(*) FILTER (WHERE status = 'in_progress')::int,
         count(*) FILTER (WHERE status = 'closed')::int
  FROM public.tb_enquiry WHERE supplier_account_id = auth.uid() AND auth.uid() IS NOT NULL
$function$;

CREATE OR REPLACE FUNCTION public.admin_lead_kpis()
 RETURNS TABLE(pending_review integer, qualified integer, rejected integer, total integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT count(*) FILTER (WHERE status = 'pending_review')::int,
         count(*) FILTER (WHERE qualified_at IS NOT NULL)::int,
         count(*) FILTER (WHERE status = 'rejected')::int,
         count(*)::int
  FROM public.tb_enquiry WHERE public.is_admin(auth.uid())
$function$;

-- Admin review: the only path that can approve or reject a pending lead.
CREATE OR REPLACE FUNCTION public.review_enquiry(_enquiry_id bigint, _decision text, _reason text DEFAULT NULL, _note text DEFAULT NULL)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _row public.tb_enquiry; _email text;
BEGIN
  IF _uid IS NULL OR NOT public.is_admin(_uid) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF _decision NOT IN ('approve','reject') THEN RAISE EXCEPTION 'INVALID_DECISION'; END IF;
  SELECT * INTO _row FROM public.tb_enquiry WHERE enquiry_id = _enquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENQUIRY_NOT_FOUND'; END IF;
  IF _row.status <> 'pending_review' THEN RAISE EXCEPTION 'LEAD_ALREADY_REVIEWED'; END IF;
  SELECT email INTO _email FROM public.tb_admin_account WHERE admin_account_id = _uid;

  IF _decision = 'approve' THEN
    PERFORM pg_advisory_xact_lock(hashtext(_row.supplier_account_id::text));
    IF NOT public.can_supplier_receive_enquiries(_row.supplier_account_id) THEN
      RAISE EXCEPTION 'SUPPLIER_QUOTA_EXHAUSTED';
    END IF;
    UPDATE public.tb_enquiry SET status = 'qualified', qualified_at = now(), reviewed_at = now(),
      reviewed_by = _uid, reviewed_by_email = _email, rejection_reason = NULL, rejection_note = NULL
    WHERE enquiry_id = _enquiry_id;
  ELSE
    IF _reason IS NULL OR _reason NOT IN ('spam','duplicate','incorrect_supplier','outside_service_area','invalid_contact_information','incomplete_enquiry','not_relevant','other') THEN
      RAISE EXCEPTION 'REJECTION_REASON_REQUIRED';
    END IF;
    UPDATE public.tb_enquiry SET status = 'rejected', reviewed_at = now(), reviewed_by = _uid,
      reviewed_by_email = _email, rejection_reason = _reason, rejection_note = NULLIF(trim(_note), '')
    WHERE enquiry_id = _enquiry_id;
  END IF;
END;
$function$;

REVOKE ALL ON FUNCTION public.review_enquiry(bigint, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_enquiry(bigint, text, text, text) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_my_lead_summary() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_lead_summary() TO authenticated;
REVOKE ALL ON FUNCTION public.admin_lead_kpis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_lead_kpis() TO authenticated;