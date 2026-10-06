CREATE TABLE public.tb_enquiry_audit (
  enquiry_audit_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  enquiry_id bigint NOT NULL REFERENCES public.tb_enquiry(enquiry_id),
  admin_account_id uuid,
  admin_email text,
  action text NOT NULL,
  original_status text,
  new_status text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tb_enquiry_audit TO authenticated;
GRANT ALL ON public.tb_enquiry_audit TO service_role;
ALTER TABLE public.tb_enquiry_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view enquiry audit" ON public.tb_enquiry_audit FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE INDEX tb_enquiry_audit_enquiry_idx ON public.tb_enquiry_audit(enquiry_id, created_at);

CREATE OR REPLACE FUNCTION public.review_enquiry(_enquiry_id bigint, _decision text, _reason text DEFAULT NULL::text, _note text DEFAULT NULL::text)
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
    INSERT INTO public.tb_enquiry_audit (enquiry_id, admin_account_id, admin_email, action, original_status, new_status)
    VALUES (_enquiry_id, _uid, _email, 'approve', _row.status, 'qualified');
  ELSE
    IF _reason IS NULL OR _reason NOT IN ('spam','duplicate','incorrect_supplier','outside_service_area','invalid_contact_information','incomplete_enquiry','not_relevant','other') THEN
      RAISE EXCEPTION 'REJECTION_REASON_REQUIRED';
    END IF;
    UPDATE public.tb_enquiry SET status = 'rejected', reviewed_at = now(), reviewed_by = _uid,
      reviewed_by_email = _email, rejection_reason = _reason, rejection_note = NULLIF(trim(_note), '')
    WHERE enquiry_id = _enquiry_id;
    INSERT INTO public.tb_enquiry_audit (enquiry_id, admin_account_id, admin_email, action, original_status, new_status, details)
    VALUES (_enquiry_id, _uid, _email, 'reject', _row.status, 'rejected', jsonb_build_object('reason', _reason));
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_archive_enquiry(_enquiry_id bigint)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _old text; _email text;
BEGIN
  IF _uid IS NULL OR NOT public.is_admin(_uid) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  SELECT status INTO _old FROM public.tb_enquiry WHERE enquiry_id = _enquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENQUIRY_NOT_FOUND'; END IF;
  IF _old = 'archived' THEN RETURN; END IF;
  SELECT email INTO _email FROM public.tb_admin_account WHERE admin_account_id = _uid;
  UPDATE public.tb_enquiry SET status = 'archived' WHERE enquiry_id = _enquiry_id;
  INSERT INTO public.tb_enquiry_audit (enquiry_id, admin_account_id, admin_email, action, original_status, new_status)
  VALUES (_enquiry_id, _uid, _email, 'archive', _old, 'archived');
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_edit_enquiry(_enquiry_id bigint, _customer_name text, _customer_email text, _customer_cell text, _message text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _row public.tb_enquiry; _email text;
BEGIN
  IF _uid IS NULL OR NOT public.is_admin(_uid) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF length(trim(coalesce(_customer_name,''))) = 0 OR length(trim(coalesce(_message,''))) = 0
     OR length(trim(coalesce(_customer_email,''))) = 0 OR length(trim(coalesce(_customer_cell,''))) = 0 THEN
    RAISE EXCEPTION 'INVALID_INPUT';
  END IF;
  SELECT * INTO _row FROM public.tb_enquiry WHERE enquiry_id = _enquiry_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ENQUIRY_NOT_FOUND'; END IF;
  SELECT email INTO _email FROM public.tb_admin_account WHERE admin_account_id = _uid;
  UPDATE public.tb_enquiry SET customer_name = left(trim(_customer_name),100), customer_email = left(trim(_customer_email),255),
    customer_cell = left(trim(_customer_cell),30), message = left(trim(_message),2000)
  WHERE enquiry_id = _enquiry_id;
  INSERT INTO public.tb_enquiry_audit (enquiry_id, admin_account_id, admin_email, action, original_status, new_status, details)
  VALUES (_enquiry_id, _uid, _email, 'edit', _row.status, _row.status,
    jsonb_build_object('before', jsonb_build_object('customer_name', _row.customer_name, 'customer_email', _row.customer_email, 'customer_cell', _row.customer_cell, 'message', _row.message)));
END;
$function$;

-- Suppliers no longer see any count of unreviewed enquiries.
CREATE OR REPLACE FUNCTION public.get_my_lead_summary()
 RETURNS TABLE(pending_review integer, qualified integer, in_progress integer, closed integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT 0,
         count(*) FILTER (WHERE status = 'qualified')::int,
         count(*) FILTER (WHERE status = 'in_progress')::int,
         count(*) FILTER (WHERE status = 'closed')::int
  FROM public.tb_enquiry WHERE supplier_account_id = auth.uid() AND auth.uid() IS NOT NULL
$function$;

GRANT EXECUTE ON FUNCTION public.admin_archive_enquiry(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_edit_enquiry(bigint, text, text, text, text) TO authenticated;