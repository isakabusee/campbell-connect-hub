-- 1. Profiles: stop exposing phone numbers to all signed-in users
DROP POLICY IF EXISTS "Anyone authenticated can view directory profiles" ON public.profiles;

CREATE OR REPLACE VIEW public.directory_profiles
WITH (security_invoker = false) AS
SELECT id, user_id, display_name, bio, avatar_url
FROM public.profiles
WHERE visible_in_directory = true;

REVOKE ALL ON public.directory_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.directory_profiles TO authenticated;

-- 2. contact_messages: replace always-true insert check with validation
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit a valid contact message"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  length(btrim(name)) BETWEEN 1 AND 100
  AND length(btrim(email)) BETWEEN 3 AND 255
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(subject)) BETWEEN 1 AND 200
  AND length(btrim(message)) BETWEEN 1 AND 5000
);

-- 3. Storage: public buckets should not be listable
DROP POLICY IF EXISTS "Anyone can view sermon files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bulletin files" ON storage.objects;

-- 4. SECURITY DEFINER function exposure
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_group_member_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_group_member_counts() TO authenticated;
