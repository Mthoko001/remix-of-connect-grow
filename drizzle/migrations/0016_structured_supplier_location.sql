ALTER TABLE public.tb_supplier_profile
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS suburb text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS street_address text;

CREATE OR REPLACE VIEW public.tb_public_supplier_listing AS
 SELECT profile.supplier_profile_id,
    profile.supplier_account_id,
    profile.business_name,
    profile.business_description,
        CASE
            WHEN profile.address IS NULL OR POSITION((','::text) IN (profile.address)) = 0 THEN NULL::text
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
    to_char(profile.opening_time::interval, 'HH24:MI'::text) AS opening_time,
    to_char(profile.closing_time::interval, 'HH24:MI'::text) AS closing_time,
    profile.province,
    profile.city,
    profile.suburb,
    profile.postal_code,
    profile.street_address
   FROM tb_supplier_profile profile
     LEFT JOIN tb_category category ON category.category_id = profile.category_id
  WHERE profile.status = 'validated'::text;