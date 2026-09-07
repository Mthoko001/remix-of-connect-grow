CREATE TABLE public.tb_admin_account (
  admin_account_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'admin',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tb_admin_account TO authenticated;
GRANT ALL ON public.tb_admin_account TO service_role;

ALTER TABLE public.tb_admin_account ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own admin record"
ON public.tb_admin_account
FOR SELECT
TO authenticated
USING (auth.uid() = admin_account_id AND is_active);

CREATE TRIGGER update_tb_admin_account_updated_at
BEFORE UPDATE ON public.tb_admin_account
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tb_admin_account
    WHERE admin_account_id = _user_id AND is_active
  )
$$;