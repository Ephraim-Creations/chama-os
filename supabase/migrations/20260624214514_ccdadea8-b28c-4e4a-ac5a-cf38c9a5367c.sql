
-- 1. chamas: restrict direct INSERT to platform admin email
DROP POLICY IF EXISTS "chamas insert by creator" ON public.chamas;
CREATE POLICY "chamas insert by admin"
ON public.chamas
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'ephraimcreations254@gmail.com'
);

-- 2. loan_guarantors: allow delete by borrower or chair/treasurer
CREATE POLICY "guarantor delete by borrower or chair"
ON public.loan_guarantors
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.loans l
    WHERE l.id = loan_guarantors.loan_id
      AND (
        l.borrower_id = auth.uid()
        OR public.has_chama_role(l.chama_id, auth.uid(), 'chairperson'::app_role)
        OR public.has_chama_role(l.chama_id, auth.uid(), 'treasurer'::app_role)
      )
  )
);

-- 3. transparency_logs: explicit restrictive deny for all client writes
CREATE POLICY "transparency_logs block insert"
ON public.transparency_logs
AS RESTRICTIVE
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "transparency_logs block update"
ON public.transparency_logs
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "transparency_logs block delete"
ON public.transparency_logs
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);
