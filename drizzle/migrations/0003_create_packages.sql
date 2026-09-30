CREATE TABLE public.tb_package (
  package_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  duration_months integer NOT NULL DEFAULT 12 CHECK (duration_months > 0),
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  updated_by uuid,
  date_created timestamptz NOT NULL DEFAULT now(),
  date_updated timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tb_package TO anon;
GRANT SELECT, INSERT, UPDATE ON public.tb_package TO authenticated;
GRANT ALL ON public.tb_package TO service_role;
ALTER TABLE public.tb_package ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views active packages" ON public.tb_package FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin(auth.uid()));
CREATE POLICY "Admins insert packages" ON public.tb_package FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins update packages" ON public.tb_package FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_package_audit()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.date_created = now();
  ELSE
    NEW.created_by = OLD.created_by;
    NEW.date_created = OLD.date_created;
  END IF;
  NEW.updated_by = auth.uid();
  NEW.date_updated = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_package_audit BEFORE INSERT OR UPDATE ON public.tb_package
FOR EACH ROW EXECUTE FUNCTION public.set_package_audit();

ALTER TABLE public.tb_subscription ADD COLUMN package_id bigint REFERENCES public.tb_package(package_id);

INSERT INTO public.tb_package (name, description, price, duration_months, benefits, sort_order)
VALUES ('Supplier Annual', 'Billed once a year. Cancel any time.', 1200, 12,
  '["Verified business listing on LeadLink","Business profile with logo and up to 6 photos","Customer enquiries via WhatsApp and in-app messaging","Supplier dashboard with enquiry tracking","Listed in category browsing and search","Verified badge shown to customers"]'::jsonb, 0);