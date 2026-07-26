CREATE TABLE public.pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  price_label text NOT NULL,
  amount_kes integer NOT NULL DEFAULT 0,
  period text NOT NULL DEFAULT 'month',
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlight boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.pricing_plans TO anon;
GRANT SELECT ON public.pricing_plans TO authenticated;
GRANT ALL ON public.pricing_plans TO service_role;

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing plans public read"
  ON public.pricing_plans FOR SELECT
  USING (published = true OR public.is_platform_admin(auth.uid()));

CREATE POLICY "pricing plans managed by platform admins"
  ON public.pricing_plans FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE TRIGGER pricing_plans_set_updated_at
  BEFORE UPDATE ON public.pricing_plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.pricing_plans (slug, name, price_label, amount_kes, period, description, features, highlight, sort_order) VALUES
('starter', 'Starter', 'Free', 0, 'month', 'For small groups finding their feet.',
 '["Up to 15 members","Contributions & loans tracking","Transparency log","Email support"]'::jsonb, false, 1),
('growth', 'Growth', 'KSh 1,500', 1500, 'month', 'For active chamas that meet monthly.',
 '["Up to 50 members","Investments & group feed","Meeting minutes & attendance","Priority support"]'::jsonb, true, 2),
('federation', 'Federation', 'Custom', 0, 'month', 'For SACCOs and multi-chama networks.',
 '["Unlimited members","Multi-chama linking","Custom reports & exports","Dedicated success manager"]'::jsonb, false, 3);