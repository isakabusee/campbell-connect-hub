DROP VIEW IF EXISTS public.directory_profiles;

CREATE TABLE public.profile_contacts (
  user_id uuid PRIMARY KEY,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_contacts TO authenticated;
GRANT ALL ON public.profile_contacts TO service_role;

ALTER TABLE public.profile_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact info" ON public.profile_contacts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contact info" ON public.profile_contacts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contact info" ON public.profile_contacts
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contact info" ON public.profile_contacts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage contact info" ON public.profile_contacts
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_profile_contacts_updated_at
BEFORE UPDATE ON public.profile_contacts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.profile_contacts (user_id, phone)
SELECT user_id, phone FROM public.profiles WHERE phone IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.profiles DROP COLUMN phone;

CREATE POLICY "Authenticated users can view directory profiles" ON public.profiles
FOR SELECT TO authenticated USING (visible_in_directory = true);
