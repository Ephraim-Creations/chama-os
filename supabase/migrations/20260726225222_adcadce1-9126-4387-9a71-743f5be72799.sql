DROP POLICY "anyone can apply" ON public.chair_applications;
CREATE POLICY "anyone can apply" ON public.chair_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND (user_id IS NULL OR user_id = auth.uid())
  );

DROP POLICY "chamas update by chair" ON public.chamas;
CREATE POLICY "chamas update by chair" ON public.chamas
  FOR UPDATE TO authenticated
  USING (public.has_chama_role(id, auth.uid(), 'chairperson'::app_role))
  WITH CHECK (
    public.has_chama_role(id, auth.uid(), 'chairperson'::app_role)
    AND created_by = auth.uid()
  );