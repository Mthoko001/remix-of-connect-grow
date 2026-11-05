CREATE TABLE public.tb_contact_message (
  contact_message_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  date_created timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.tb_contact_message TO service_role;
ALTER TABLE public.tb_contact_message ENABLE ROW LEVEL SECURITY;