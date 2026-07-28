CREATE UNIQUE INDEX IF NOT EXISTS chamas_creator_name_unique
  ON public.chamas (created_by, lower(name))
  WHERE created_by IS NOT NULL;