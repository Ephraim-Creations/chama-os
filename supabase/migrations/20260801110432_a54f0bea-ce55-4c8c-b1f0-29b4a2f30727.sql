-- Memberships: chair cannot insert a chairperson row for anyone
DROP POLICY IF EXISTS "memberships insert by chair" ON public.memberships;
CREATE POLICY "memberships insert by chair"
  ON public.memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
    AND role <> 'chairperson'::app_role
  );

-- Feed posts: only the chairperson may mark a post as an announcement
DROP POLICY IF EXISTS "feed update by author" ON public.feed_posts;
CREATE POLICY "feed update by author"
  ON public.feed_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND public.is_member_of(chama_id, auth.uid()))
  WITH CHECK (
    auth.uid() = author_id
    AND public.is_member_of(chama_id, auth.uid())
    AND (
      is_announcement = false
      OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
    )
  );

DROP POLICY IF EXISTS "feed write by members" ON public.feed_posts;
CREATE POLICY "feed write by members"
  ON public.feed_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_member_of(chama_id, auth.uid())
    AND auth.uid() = author_id
    AND (
      is_announcement = false
      OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
    )
  );