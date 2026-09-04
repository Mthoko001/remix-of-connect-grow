CREATE TABLE public.tb_supplier_profile (
  supplier_profile_id bigint generated always as identity primary key,
  supplier_account_id uuid not null references public.tb_supplier_account(supplier_account_id) on delete cascade,
  business_name text not null default '',
  business_description text,
  address text,
  cell_no text,
  business_logo text,
  product_images jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  notes text,
  date_created timestamptz not null default now(),
  date_updated timestamptz not null default now(),
  updated_by uuid,
  constraint tb_supplier_profile_account_unique unique (supplier_account_id)
);

GRANT SELECT, INSERT, UPDATE ON public.tb_supplier_profile TO authenticated;
GRANT ALL ON public.tb_supplier_profile TO service_role;

ALTER TABLE public.tb_supplier_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view their own profile"
  ON public.tb_supplier_profile FOR SELECT TO authenticated
  USING (auth.uid() = supplier_account_id);

CREATE POLICY "Suppliers can create their own profile"
  ON public.tb_supplier_profile FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = supplier_account_id);

CREATE POLICY "Suppliers can update their own profile"
  ON public.tb_supplier_profile FOR UPDATE TO authenticated
  USING (auth.uid() = supplier_account_id)
  WITH CHECK (auth.uid() = supplier_account_id);

CREATE OR REPLACE FUNCTION public.update_date_updated_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.date_updated = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_date_updated_column() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER update_tb_supplier_profile_date_updated
  BEFORE UPDATE ON public.tb_supplier_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_date_updated_column();