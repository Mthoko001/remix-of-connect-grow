CREATE TABLE public.tb_supplier_account (
  supplier_account_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending_onboarding'
    CHECK (status IN ('pending_onboarding','onboarding','pending_verification','verified','suspended')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.tb_supplier_account TO authenticated;
GRANT ALL ON public.tb_supplier_account TO service_role;

ALTER TABLE public.tb_supplier_account ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view their own account"
  ON public.tb_supplier_account FOR SELECT TO authenticated
  USING (auth.uid() = supplier_account_id);

CREATE POLICY "Suppliers can insert their own account"
  ON public.tb_supplier_account FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = supplier_account_id);

CREATE POLICY "Suppliers can update their own account"
  ON public.tb_supplier_account FOR UPDATE TO authenticated
  USING (auth.uid() = supplier_account_id)
  WITH CHECK (auth.uid() = supplier_account_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tb_supplier_account_updated_at
  BEFORE UPDATE ON public.tb_supplier_account
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_supplier_account()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tb_supplier_account (supplier_account_id, email, status)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'pending_onboarding')
  ON CONFLICT (supplier_account_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_supplier_account
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_supplier_account();