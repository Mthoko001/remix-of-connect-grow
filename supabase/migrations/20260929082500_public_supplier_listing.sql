create or replace view public.tb_public_supplier_listing
with (security_barrier = true)
as
select
  profile.supplier_profile_id,
  profile.supplier_account_id,
  profile.business_name,
  profile.business_description,
  case
    when profile.address is null or position(',' in profile.address) = 0 then null
    else regexp_replace(trim(profile.address), '^[^,]*,\s*', '')
  end as public_area,
  category.name as category_name
from public.tb_supplier_profile as profile
left join public.tb_category as category
  on category.category_id = profile.category_id
where profile.status = 'validated';

revoke all on public.tb_public_supplier_listing from public;
grant select on public.tb_public_supplier_listing to anon, authenticated;
