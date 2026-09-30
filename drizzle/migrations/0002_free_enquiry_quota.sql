CREATE INDEX IF NOT EXISTS idx_tb_enquiry_supplier ON public.tb_enquiry (supplier_account_id);
CREATE INDEX IF NOT EXISTS idx_tb_subscription_supplier ON public.tb_subscription (supplier_account_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.supplier_has_active_subscription(_supplier_account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tb_subscription
    WHERE supplier_account_id = _supplier_account_id
      AND subscription_status = 'paid'
      AND (paid_at IS NULL OR paid_at > now() - interval '1 year')
  )
$$;

CREATE OR REPLACE FUNCTION public.supplier_monetization_status(_total integer, _active boolean)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _active THEN 'subscribed' WHEN _total >= 5 THEN 'quota_reached' ELSE 'free_plan' END
$$;

CREATE OR REPLACE FUNCTION public.can_supplier_receive_enquiries(_supplier_account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.supplier_has_active_subscription(_supplier_account_id)
      OR (SELECT count(*) FROM public.tb_enquiry WHERE supplier_account_id = _supplier_account_id) < 5
$$;

CREATE OR REPLACE FUNCTION public.get_my_lead_status()
RETURNS TABLE (total_enquiries integer, free_limit integer, has_active_subscription boolean, monetization_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH s AS (
    SELECT (SELECT count(*)::int FROM public.tb_enquiry WHERE supplier_account_id = auth.uid()) AS total,
           public.supplier_has_active_subscription(auth.uid()) AS active
  )
  SELECT total, 5, active, public.supplier_monetization_status(total, active) FROM s WHERE auth.uid() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.admin_supplier_monetization()
RETURNS TABLE (supplier_account_id uuid, total_enquiries integer, has_active_subscription boolean, monetization_status text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.supplier_account_id, COALESCE(e.total, 0)::int,
         public.supplier_has_active_subscription(a.supplier_account_id),
         public.supplier_monetization_status(COALESCE(e.total, 0)::int, public.supplier_has_active_subscription(a.supplier_account_id))
  FROM public.tb_supplier_account a
  LEFT JOIN (SELECT supplier_account_id, count(*) AS total FROM public.tb_enquiry GROUP BY 1) e
    ON e.supplier_account_id = a.supplier_account_id
  WHERE public.is_admin(auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.enforce_enquiry_quota()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(NEW.supplier_account_id::text));
  IF NOT public.can_supplier_receive_enquiries(NEW.supplier_account_id) THEN
    RAISE EXCEPTION 'SUPPLIER_QUOTA_EXHAUSTED' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_enquiry_quota ON public.tb_enquiry;
CREATE TRIGGER trg_enforce_enquiry_quota BEFORE INSERT ON public.tb_enquiry
FOR EACH ROW EXECUTE FUNCTION public.enforce_enquiry_quota();

REVOKE ALL ON FUNCTION public.supplier_has_active_subscription(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_enquiry_quota() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_supplier_receive_enquiries(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_lead_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_supplier_monetization() TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_lead_status() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_supplier_monetization() FROM PUBLIC, anon;