
-- 1. chama_invites: restrict invitee updates
CREATE OR REPLACE FUNCTION public.chama_invites_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  is_chair boolean;
BEGIN
  is_chair := public.has_chama_role(OLD.chama_id, auth.uid(), 'chairperson'::app_role);

  IF NOT is_chair THEN
    IF NEW.chama_id IS DISTINCT FROM OLD.chama_id
       OR NEW.role IS DISTINCT FROM OLD.role
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.invited_by IS DISTINCT FROM OLD.invited_by
       OR NEW.token IS DISTINCT FROM OLD.token THEN
      RAISE EXCEPTION 'invite fields are immutable';
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status
       AND NOT (OLD.status = 'pending'::invite_status AND NEW.status = 'accepted'::invite_status) THEN
      RAISE EXCEPTION 'invalid invite status transition';
    END IF;
  ELSE
    IF NEW.chama_id IS DISTINCT FROM OLD.chama_id THEN
      RAISE EXCEPTION 'chama_id is immutable';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chama_invites_guard_update ON public.chama_invites;
CREATE TRIGGER chama_invites_guard_update
BEFORE UPDATE ON public.chama_invites
FOR EACH ROW EXECUTE FUNCTION public.chama_invites_guard_update();

DROP POLICY IF EXISTS "invites update by invitee email" ON public.chama_invites;
CREATE POLICY "invites update by invitee email"
ON public.chama_invites
FOR UPDATE
TO authenticated
USING (lower(email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
WITH CHECK (
  lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  AND status IN ('pending'::invite_status, 'accepted'::invite_status)
);

DROP POLICY IF EXISTS "invites update by chair" ON public.chama_invites;
CREATE POLICY "invites update by chair"
ON public.chama_invites
FOR UPDATE
TO authenticated
USING (public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role))
WITH CHECK (public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role));

-- 2. chamas: chair updates cannot change ownership fields
CREATE OR REPLACE FUNCTION public.chamas_guard_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'created_by is immutable';
  END IF;
  IF NEW.invite_code IS DISTINCT FROM OLD.invite_code THEN
    RAISE EXCEPTION 'invite_code is immutable';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS chamas_guard_update ON public.chamas;
CREATE TRIGGER chamas_guard_update
BEFORE UPDATE ON public.chamas
FOR EACH ROW EXECUTE FUNCTION public.chamas_guard_update();

DROP POLICY IF EXISTS "chamas update by chair" ON public.chamas;
CREATE POLICY "chamas update by chair"
ON public.chamas
FOR UPDATE
TO authenticated
USING (public.has_chama_role(id, auth.uid(), 'chairperson'::app_role))
WITH CHECK (
  public.has_chama_role(id, auth.uid(), 'chairperson'::app_role)
  AND created_by = created_by
);
