CREATE OR REPLACE FUNCTION public.shares_chama_with(_a uuid, _b uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships m1
    JOIN public.memberships m2 ON m1.chama_id = m2.chama_id
    WHERE m1.user_id = _a AND m2.user_id = _b
  );
$$;

DROP POLICY IF EXISTS "Signed-in users can view avatars" ON storage.objects;

CREATE POLICY "Users can view own or chama-mate avatars"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.shares_chama_with(auth.uid(), NULLIF((storage.foldername(name))[1], '')::uuid)
  )
);