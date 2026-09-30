create table public.tb_category (
  category_id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  parent_category_id bigint references public.tb_category(category_id) on delete restrict,
  created_at timestamptz not null default now()
);
grant select on public.tb_category to anon, authenticated;
grant insert, update, delete on public.tb_category to authenticated;
grant all on public.tb_category to service_role;
alter table public.tb_category enable row level security;
create policy "Anyone can view categories" on public.tb_category for select to anon, authenticated using (true);
create policy "Admins insert categories" on public.tb_category for insert to authenticated with check (public.is_admin(auth.uid()));
create policy "Admins update categories" on public.tb_category for update to authenticated using (public.is_admin(auth.uid()));
create policy "Admins delete categories" on public.tb_category for delete to authenticated using (public.is_admin(auth.uid()));

alter table public.tb_supplier_profile
  add column category_id bigint references public.tb_category(category_id) on delete restrict,
  add column rejection_reason text;

create policy "Admins can view all profiles" on public.tb_supplier_profile for select to authenticated using (public.is_admin(auth.uid()));
create policy "Admins can update all profiles" on public.tb_supplier_profile for update to authenticated using (public.is_admin(auth.uid()));
create policy "Admins can view all supplier accounts" on public.tb_supplier_account for select to authenticated using (public.is_admin(auth.uid()));

create table public.tb_enquiry (
  enquiry_id bigint generated always as identity primary key,
  supplier_account_id uuid not null references public.tb_supplier_account(supplier_account_id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_cell text not null,
  message text not null,
  channel text not null check (channel in ('whatsapp','in_app')),
  image_path text,
  status text not null default 'new' check (status in ('new','read','replied')),
  created_at timestamptz not null default now()
);
grant insert on public.tb_enquiry to anon;
grant select, insert, update on public.tb_enquiry to authenticated;
grant all on public.tb_enquiry to service_role;
alter table public.tb_enquiry enable row level security;
create policy "Anyone can submit enquiries" on public.tb_enquiry for insert to anon, authenticated with check (status = 'new');
create policy "Suppliers and admins view enquiries" on public.tb_enquiry for select to authenticated using (auth.uid() = supplier_account_id or public.is_admin(auth.uid()));
create policy "Suppliers update own enquiries" on public.tb_enquiry for update to authenticated using (auth.uid() = supplier_account_id) with check (auth.uid() = supplier_account_id);

create table public.tb_subscription (
  subscription_id bigint generated always as identity primary key,
  supplier_account_id uuid not null references public.tb_supplier_account(supplier_account_id) on delete cascade,
  amount numeric(10,2) not null,
  subscription_status text not null default 'unpaid',
  is_test boolean not null default true,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.tb_subscription to authenticated;
grant all on public.tb_subscription to service_role;
alter table public.tb_subscription enable row level security;
create policy "Suppliers and admins view subscriptions" on public.tb_subscription for select to authenticated using (auth.uid() = supplier_account_id or public.is_admin(auth.uid()));
create policy "Suppliers create own test subscription" on public.tb_subscription for insert to authenticated with check (auth.uid() = supplier_account_id and is_test = true);

create or replace view public.tb_public_supplier_listing
with (security_barrier = true)
as
select profile.supplier_profile_id, profile.supplier_account_id, profile.business_name, profile.business_description,
  case when profile.address is null or position(',' in profile.address) = 0 then null
       else regexp_replace(trim(profile.address), '^[^,]*,\s*', '') end as public_area,
  category.name as category_name
from public.tb_supplier_profile as profile
left join public.tb_category as category on category.category_id = profile.category_id
where profile.status = 'validated';
revoke all on public.tb_public_supplier_listing from public;
grant select on public.tb_public_supplier_listing to anon, authenticated;

create policy "Anyone can upload enquiry media" on storage.objects for insert to anon, authenticated with check (bucket_id = 'enquiry-media');
create policy "Suppliers and admins read enquiry media" on storage.objects for select to authenticated using (bucket_id = 'enquiry-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin(auth.uid())));