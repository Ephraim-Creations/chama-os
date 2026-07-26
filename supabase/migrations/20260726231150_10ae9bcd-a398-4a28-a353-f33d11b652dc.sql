ALTER TABLE public.chamas ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

CREATE TABLE IF NOT EXISTS public.user_pins (
  user_id uuid PRIMARY KEY,
  pin_hash text NOT NULL,
  salt text NOT NULL,
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.user_pins TO service_role;

ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_user_pins_updated_at
BEFORE UPDATE ON public.user_pins
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();