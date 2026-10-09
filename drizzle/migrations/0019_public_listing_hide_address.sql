DROP VIEW IF EXISTS public.tb_public_supplier_listing;
CREATE VIEW public.tb_public_supplier_listing AS
SELECT profile.supplier_profile_id, profile.supplier_account_id, profile.business_name, profile.business_description,
  category.name AS category_name, profile.business_logo, profile.product_images, profile.is_service_provider,
  profile.is_product_seller, profile.service_categories, profile.other_service, profile.products_offered,
  to_char(profile.opening_time::interval, 'HH24:MI') AS opening_time,
  to_char(profile.closing_time::interval, 'HH24:MI') AS closing_time,
  profile.province, profile.city, profile.cover_image, profile.date_created
FROM public.tb_supplier_profile profile
LEFT JOIN public.tb_category category ON category.category_id = profile.category_id
WHERE profile.status = 'validated';
GRANT SELECT ON public.tb_public_supplier_listing TO anon, authenticated;
GRANT ALL ON public.tb_public_supplier_listing TO service_role;