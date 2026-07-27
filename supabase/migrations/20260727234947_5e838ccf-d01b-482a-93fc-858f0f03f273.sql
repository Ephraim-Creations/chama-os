CREATE OR REPLACE FUNCTION public.memberships_guard_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'chairperson'::app_role THEN
    IF auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'chairperson role cannot be assigned through memberships writes';
    END IF;
  END IF;

  IF NEW.role IN ('treasurer'::app_role, 'secretary'::app_role) THEN
    IF EXISTS (
      SELECT 1 FROM public.memberships
      WHERE chama_id = NEW.chama_id
        AND role = NEW.role
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'a % already exists for this chama', NEW.role;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;