REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.tb_blog_post FROM anon, authenticated;
GRANT SELECT ON public.tb_blog_post TO anon, authenticated;
REVOKE ALL ON SEQUENCE public.tb_blog_post_blog_post_id_seq FROM anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.tb_blog_post_blog_post_id_seq TO service_role;