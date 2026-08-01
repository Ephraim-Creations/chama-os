GRANT ALL ON public.user_pins TO service_role;
REVOKE ALL ON public.user_pins FROM anon, authenticated;
ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;