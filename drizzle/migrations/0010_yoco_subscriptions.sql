ALTER TABLE public.tb_subscription
  ADD COLUMN starts_at timestamptz,
  ADD COLUMN expires_at timestamptz,
  ADD COLUMN gateway text NOT NULL DEFAULT 'test',
  ADD COLUMN gateway_reference text,
  ADD COLUMN payment_reference text,
  ADD COLUMN failure_reason text,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
CREATE UNIQUE INDEX tb_subscription_gateway_reference_key ON public.tb_subscription (gateway_reference) WHERE gateway_reference IS NOT NULL;
CREATE INDEX tb_subscription_supplier_expiry ON public.tb_subscription (supplier_account_id, expires_at DESC);

UPDATE public.tb_subscription SET starts_at = paid_at, expires_at = paid_at + interval '1 year'
  WHERE subscription_status = 'paid' AND paid_at IS NOT NULL AND expires_at IS NULL;

ALTER TABLE public.tb_package ADD COLUMN is_recommended boolean NOT NULL DEFAULT false;

-- Payments are written only by the server after gateway confirmation.
DROP POLICY IF EXISTS "Suppliers create own test subscription" ON public.tb_subscription;

CREATE OR REPLACE FUNCTION public.supplier_has_active_subscription(_supplier_account_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tb_subscription
    WHERE supplier_account_id = _supplier_account_id
      AND subscription_status = 'paid'
      AND COALESCE(expires_at, paid_at + interval '1 year') > now()
  )
$$;