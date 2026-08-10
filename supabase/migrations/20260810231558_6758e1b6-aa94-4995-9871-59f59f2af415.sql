DROP POLICY IF EXISTS "Anyone can submit a valid contact message" ON public.contact_messages;
REVOKE INSERT ON public.contact_messages FROM anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;