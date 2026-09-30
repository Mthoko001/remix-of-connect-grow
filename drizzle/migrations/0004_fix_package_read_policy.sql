DROP POLICY "Anyone views active packages" ON public.tb_package;
CREATE POLICY "Anyone views active packages" ON public.tb_package FOR SELECT TO anon, authenticated USING (is_active);
CREATE POLICY "Admins view all packages" ON public.tb_package FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));