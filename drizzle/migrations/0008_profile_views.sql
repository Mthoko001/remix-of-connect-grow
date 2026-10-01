CREATE TABLE public.tb_profile_view (
  profile_view_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  supplier_account_id uuid NOT NULL REFERENCES public.tb_supplier_account(supplier_account_id) ON DELETE CASCADE,
  visitor_hash text NOT NULL,
  viewer_account_id uuid,
  viewed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tb_profile_view TO authenticated;
GRANT ALL ON public.tb_profile_view TO service_role;
ALTER TABLE public.tb_profile_view ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers and admins view profile views" ON public.tb_profile_view
  FOR SELECT TO authenticated
  USING (auth.uid() = supplier_account_id OR public.is_admin(auth.uid()));
CREATE INDEX idx_profile_view_supplier_time ON public.tb_profile_view (supplier_account_id, viewed_at DESC);
CREATE INDEX idx_profile_view_dedupe ON public.tb_profile_view (supplier_account_id, visitor_hash, viewed_at DESC);
CREATE INDEX idx_profile_view_time ON public.tb_profile_view (viewed_at DESC);

-- Records one view; skips self, admins, non-validated suppliers and repeats within 30 minutes.
CREATE OR REPLACE FUNCTION public.record_profile_view(_supplier_account_id uuid, _visitor_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _hash text;
BEGIN
  IF _visitor_id IS NULL OR length(_visitor_id) < 8 OR length(_visitor_id) > 100 THEN RETURN false; END IF;
  IF _uid IS NOT NULL AND (_uid = _supplier_account_id OR public.is_admin(_uid)) THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tb_supplier_profile WHERE supplier_account_id = _supplier_account_id AND status = 'validated') THEN RETURN false; END IF;
  _hash := md5(COALESCE(_uid::text, _visitor_id));
  IF EXISTS (SELECT 1 FROM public.tb_profile_view WHERE supplier_account_id = _supplier_account_id AND visitor_hash = _hash AND viewed_at > now() - interval '30 minutes') THEN RETURN false; END IF;
  INSERT INTO public.tb_profile_view (supplier_account_id, visitor_hash, viewer_account_id) VALUES (_supplier_account_id, _hash, _uid);
  RETURN true;
END $$;
GRANT EXECUTE ON FUNCTION public.record_profile_view(uuid, text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_profile_view_stats()
RETURNS TABLE(total_views integer, views_this_month integer, views_last_month integer, views_this_week integer, daily jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    (SELECT count(*)::int FROM tb_profile_view WHERE supplier_account_id = auth.uid()),
    (SELECT count(*)::int FROM tb_profile_view WHERE supplier_account_id = auth.uid() AND viewed_at >= date_trunc('month', now())),
    (SELECT count(*)::int FROM tb_profile_view WHERE supplier_account_id = auth.uid() AND viewed_at >= date_trunc('month', now()) - interval '1 month' AND viewed_at < date_trunc('month', now())),
    (SELECT count(*)::int FROM tb_profile_view WHERE supplier_account_id = auth.uid() AND viewed_at >= date_trunc('week', now())),
    (SELECT jsonb_agg(jsonb_build_object('day', d::date, 'views', COALESCE(c.n, 0)) ORDER BY d)
       FROM generate_series(current_date - 29, current_date, interval '1 day') d
       LEFT JOIN (SELECT viewed_at::date AS day, count(*)::int AS n FROM tb_profile_view
                  WHERE supplier_account_id = auth.uid() AND viewed_at >= current_date - 29 GROUP BY 1) c ON c.day = d::date)
  WHERE auth.uid() IS NOT NULL
$$;
GRANT EXECUTE ON FUNCTION public.get_my_profile_view_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_top_profile_views(_limit integer DEFAULT 10)
RETURNS TABLE(supplier_account_id uuid, business_name text, total_views integer, views_this_month integer, platform_total integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT v.supplier_account_id, COALESCE(p.business_name, ''), count(*)::int,
         count(*) FILTER (WHERE v.viewed_at >= date_trunc('month', now()))::int,
         (SELECT count(*)::int FROM tb_profile_view)
  FROM tb_profile_view v LEFT JOIN tb_supplier_profile p ON p.supplier_account_id = v.supplier_account_id
  WHERE public.is_admin(auth.uid())
  GROUP BY v.supplier_account_id, p.business_name
  ORDER BY count(*) DESC LIMIT LEAST(GREATEST(_limit, 1), 50)
$$;
GRANT EXECUTE ON FUNCTION public.admin_top_profile_views(integer) TO authenticated;