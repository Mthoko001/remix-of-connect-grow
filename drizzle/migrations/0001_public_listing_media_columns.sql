CREATE OR REPLACE VIEW public.tb_public_supplier_listing WITH (security_barrier = true) AS
SELECT profile.supplier_profile_id,
    profile.supplier_account_id,
    profile.business_name,
    profile.business_description,
    CASE
        WHEN profile.address IS NULL OR POSITION(',' IN profile.address) = 0 THEN NULL::text
        ELSE regexp_replace(TRIM(BOTH FROM profile.address), '^[^,]*,\s*', '')
    END AS public_area,
    category.name AS category_name,
    profile.business_logo,
    profile.product_images
FROM public.tb_supplier_profile profile
LEFT JOIN public.tb_category category ON category.category_id = profile.category_id
WHERE profile.status = 'validated';

GRANT SELECT ON public.tb_public_supplier_listing TO anon, authenticated;
GRANT ALL ON public.tb_public_supplier_listing TO service_role;