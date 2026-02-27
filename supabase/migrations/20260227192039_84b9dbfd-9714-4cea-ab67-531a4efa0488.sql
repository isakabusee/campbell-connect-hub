
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view group memberships" ON public.small_group_members;

-- Users can view their own memberships
CREATE POLICY "Users can view own memberships"
  ON public.small_group_members FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create a function to get member counts per group (no individual user data exposed)
CREATE OR REPLACE FUNCTION public.get_group_member_counts()
RETURNS TABLE(group_id uuid, member_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT group_id, COUNT(*) as member_count
  FROM public.small_group_members
  GROUP BY group_id;
$$;
