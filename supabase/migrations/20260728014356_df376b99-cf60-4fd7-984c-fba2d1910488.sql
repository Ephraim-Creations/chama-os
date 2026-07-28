ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS installment_amount numeric,
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS plan_notes text;

CREATE TABLE IF NOT EXISTS public.loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
  chama_id uuid NOT NULL REFERENCES public.chamas(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  paid_on date NOT NULL DEFAULT current_date,
  note text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.loan_repayments TO authenticated;
GRANT ALL ON public.loan_repayments TO service_role;

ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loan repayments readable by chama members"
  ON public.loan_repayments FOR SELECT TO authenticated
  USING (public.is_member_of(chama_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.sync_loan_repaid()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.loan_id, OLD.loan_id);
  total numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total FROM public.loan_repayments WHERE loan_id = target;
  UPDATE public.loans
     SET amount_repaid = total,
         status = CASE WHEN total >= amount THEN 'completed'::loan_status
                       WHEN status = 'completed' THEN 'active'::loan_status
                       ELSE status END
   WHERE id = target;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_loan_repaid() FROM PUBLIC, anon;

DROP TRIGGER IF EXISTS loan_repayments_sync ON public.loan_repayments;
CREATE TRIGGER loan_repayments_sync
AFTER INSERT OR UPDATE OR DELETE ON public.loan_repayments
FOR EACH ROW EXECUTE FUNCTION public.sync_loan_repaid();

CREATE OR REPLACE FUNCTION public.touch_loan_repayments_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_loan_repayments_updated_at() FROM PUBLIC, anon;

CREATE TRIGGER update_loan_repayments_updated_at
BEFORE UPDATE ON public.loan_repayments
FOR EACH ROW EXECUTE FUNCTION public.touch_loan_repayments_updated_at();