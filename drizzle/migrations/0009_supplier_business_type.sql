ALTER TABLE public.tb_supplier_profile
  ADD COLUMN is_service_provider boolean NOT NULL DEFAULT false,
  ADD COLUMN is_product_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN service_categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN other_service text,
  ADD COLUMN products_offered text[] NOT NULL DEFAULT '{}',
  ADD COLUMN opening_time time NOT NULL DEFAULT '09:00',
  ADD COLUMN closing_time time NOT NULL DEFAULT '17:00';

CREATE OR REPLACE VIEW public.tb_public_supplier_listing WITH (security_barrier = true) AS
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
    to_char(profile.opening_time, 'HH24:MI') AS opening_time,
    to_char(profile.closing_time, 'HH24:MI') AS closing_time
   FROM tb_supplier_profile profile
     LEFT JOIN tb_category category ON category.category_id = profile.category_id
  WHERE profile.status = 'validated'::text;