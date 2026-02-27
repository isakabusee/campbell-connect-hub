
-- Profiles table for member directory
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  phone text,
  bio text,
  avatar_url text,
  visible_in_directory boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view directory profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (visible_in_directory = true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Small groups table
CREATE TABLE public.small_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  meeting_day text,
  meeting_time text,
  location text,
  leader_name text,
  max_members integer,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.small_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published groups"
  ON public.small_groups FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can manage groups"
  ON public.small_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_small_groups_updated_at
  BEFORE UPDATE ON public.small_groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Small group memberships
CREATE TABLE public.small_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.small_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE public.small_group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view group memberships"
  ON public.small_group_members FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can join groups"
  ON public.small_group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.small_group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage memberships"
  ON public.small_group_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
