CREATE TABLE public.deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount_per_member numeric NOT NULL CHECK (amount_per_member > 0),
  notes text,
  applied_on date NOT NULL DEFAULT (now()::date),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.deduction_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deduction_id uuid NOT NULL REFERENCES public.deductions(id) ON DELETE CASCADE,
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (deduction_id, member_id)
);

CREATE INDEX deductions_chama_idx ON public.deductions(chama_id);
CREATE INDEX deduction_members_chama_idx ON public.deduction_members(chama_id);
CREATE INDEX deduction_members_member_idx ON public.deduction_members(member_id);

GRANT SELECT ON public.deductions TO authenticated;
GRANT ALL ON public.deductions TO service_role;
GRANT SELECT ON public.deduction_members TO authenticated;
GRANT ALL ON public.deduction_members TO service_role;

ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deduction_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view deductions"
  ON public.deductions FOR SELECT TO authenticated
  USING (public.is_member_of(chama_id, auth.uid()));

CREATE POLICY "Members can view deduction rows"
  ON public.deduction_members FOR SELECT TO authenticated
  USING (public.is_member_of(chama_id, auth.uid()));

CREATE TRIGGER deductions_set_updated_at
  BEFORE UPDATE ON public.deductions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();