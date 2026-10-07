ALTER TABLE public.tb_category ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE public.tb_supplier_profile ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE public.tb_supplier_profile ADD COLUMN IF NOT EXISTS category_review_required boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.admin_category_supplier_counts()
RETURNS TABLE(category_id bigint, supplier_count integer, live_count integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT category_id, count(*)::int, count(*) FILTER (WHERE status = 'validated')::int
  FROM public.tb_supplier_profile
  WHERE category_id IS NOT NULL AND public.is_admin(auth.uid())
  GROUP BY category_id
$$;
GRANT EXECUTE ON FUNCTION public.admin_category_supplier_counts() TO authenticated;

CREATE POLICY "Admins read supplier media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'supplier-media' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins upload supplier media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-media' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins update supplier media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'supplier-media' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'supplier-media' AND public.is_admin(auth.uid()));
CREATE POLICY "Admins delete supplier media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-media' AND public.is_admin(auth.uid()));

CREATE OR REPLACE VIEW public.tb_public_supplier_listing AS
SELECT profile.supplier_profile_id,
    profile.supplier_account_id,
    profile.business_name,
    profile.business_description,
        CASE
            WHEN ((profile.address IS NULL) OR (POSITION((','::text) IN (profile.address)) = 0)) THEN NULL::text
            ELSE regexp_replace(TRIM(BOTH FROM profile.address), '^[^,]*,\s*'::text, ''::text)
        END AS public_area,
    category.name AS category_name,
    profile.business_logo,
    profile.product_images,
    profile.is_service_provider,
    profile.is_product_seller,
    profile.service_categories,
    profile.other_service,
    profile.products_offered,
    to_char((profile.opening_time)::interval, 'HH24:MI'::text) AS opening_time,
    to_char((profile.closing_time)::interval, 'HH24:MI'::text) AS closing_time,
    profile.province,
    profile.city,
    profile.suburb,
    profile.postal_code,
    profile.street_address,
    profile.cover_image
   FROM (tb_supplier_profile profile
     LEFT JOIN tb_category category ON ((category.category_id = profile.category_id)))
  WHERE (profile.status = 'validated'::text);