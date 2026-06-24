
-- 1. loans: prevent mutation of immutable identity/financial-anchor fields
CREATE OR REPLACE FUNCTION public.loans_guard_immutable_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF NEW.borrower_id IS DISTINCT FROM OLD.borrower_id THEN
    RAISE EXCEPTION 'borrower_id is immutable';
  END IF;
  IF NEW.chama_id IS DISTINCT FROM OLD.chama_id THEN
    RAISE EXCEPTION 'chama_id is immutable';
  END IF;
  IF NEW.amount IS DISTINCT FROM OLD.amount THEN
    RAISE EXCEPTION 'amount is immutable once a loan exists';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS loans_guard_immutable_fields ON public.loans;
CREATE TRIGGER loans_guard_immutable_fields
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.loans_guard_immutable_fields();

-- Also pin RLS WITH CHECK so the role gate is enforced on the post-image too.
DROP POLICY IF EXISTS "loans update by treasurer or chair" ON public.loans;
CREATE POLICY "loans update by treasurer or chair"
ON public.loans
FOR UPDATE
TO authenticated
USING (
  public.has_chama_role(chama_id, auth.uid(), 'treasurer'::app_role)
  OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
)
WITH CHECK (
  public.has_chama_role(chama_id, auth.uid(), 'treasurer'::app_role)
  OR public.has_chama_role(chama_id, auth.uid(), 'chairperson'::app_role)
);

-- 2. meeting_attendance: explicit DELETE policy scoped to the chama secretary
CREATE POLICY "attendance delete by secretary"
ON public.meeting_attendance
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = meeting_attendance.meeting_id
      AND public.has_chama_role(m.chama_id, auth.uid(), 'secretary'::app_role)
  )
);

-- 3. memberships: enforce a single treasurer and a single secretary per chama,
--    and block self-promotion or assigning the chairperson role via update.
CREATE OR REPLACE FUNCTION public.memberships_guard_role_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'chairperson'::app_role THEN
    RAISE EXCEPTION 'chairperson role cannot be assigned through memberships writes';
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

DROP TRIGGER IF EXISTS memberships_guard_role_assignment ON public.memberships;
CREATE TRIGGER memberships_guard_role_assignment
BEFORE INSERT OR UPDATE OF role ON public.memberships
FOR EACH ROW
EXECUTE FUNCTION public.memberships_guard_role_assignment();
