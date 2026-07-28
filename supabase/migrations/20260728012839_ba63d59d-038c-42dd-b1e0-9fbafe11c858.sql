DROP POLICY IF EXISTS "chamas insert by approved chair" ON public.chamas;

CREATE POLICY "chamas insert by platform admin only"
ON public.chamas
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND public.is_platform_admin(auth.uid())
);