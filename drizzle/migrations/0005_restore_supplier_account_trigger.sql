DROP TRIGGER IF EXISTS on_auth_user_created_supplier ON auth.users;
CREATE TRIGGER on_auth_user_created_supplier
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_supplier_account();

INSERT INTO public.tb_supplier_account (supplier_account_id, email, status)
SELECT u.id, COALESCE(u.email,''), 'pending_onboarding'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.tb_admin_account a WHERE a.admin_account_id = u.id)
ON CONFLICT (supplier_account_id) DO NOTHING;