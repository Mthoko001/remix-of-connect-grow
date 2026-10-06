ALTER TABLE public.tb_supplier_account
  ADD COLUMN IF NOT EXISTS terms_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS policies_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version text,
  ADD COLUMN IF NOT EXISTS privacy_version text;

CREATE OR REPLACE FUNCTION public.handle_new_supplier_account()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _tv text := left(NULLIF(NEW.raw_user_meta_data->>'terms_version',''),20);
        _pv text := left(NULLIF(NEW.raw_user_meta_data->>'privacy_version',''),20);
BEGIN
  INSERT INTO public.tb_supplier_account (supplier_account_id, email, status,
    terms_accepted, privacy_accepted, policies_accepted_at, terms_version, privacy_version)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 'pending_onboarding',
    _tv IS NOT NULL, _pv IS NOT NULL,
    CASE WHEN _tv IS NOT NULL OR _pv IS NOT NULL THEN now() END, _tv, _pv)
  ON CONFLICT (supplier_account_id) DO NOTHING;
  RETURN NEW;
END;
$function$;