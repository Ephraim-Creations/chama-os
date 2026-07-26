-- 1. Platform admins
CREATE TABLE public.platform_admins (
  user_id uuid PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_admins TO authenticated;
GRANT ALL ON public.platform_admins TO service_role;
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = _user);
$$;

CREATE POLICY "platform admins read the list" ON public.platform_admins
  FOR SELECT TO authenticated USING (public.is_platform_admin(auth.uid()));

-- 2. Chair applications
CREATE TABLE public.chair_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  chama_name text NOT NULL,
  location text,
  note text,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chair_applications_status_check CHECK (status IN ('pending','approved','rejected'))
);
CREATE UNIQUE INDEX chair_applications_email_pending_idx
  ON public.chair_applications (lower(email)) WHERE status = 'pending';
CREATE INDEX chair_applications_email_idx ON public.chair_applications (lower(email));

GRANT INSERT ON public.chair_applications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chair_applications TO authenticated;
GRANT ALL ON public.chair_applications TO service_role;
ALTER TABLE public.chair_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can apply" ON public.chair_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND reviewed_at IS NULL);

CREATE POLICY "applicants read their own application" ON public.chair_applications
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid())
    OR lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "platform admins decide applications" ON public.chair_applications
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER chair_applications_updated_at
  BEFORE UPDATE ON public.chair_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Who may create a chama
CREATE OR REPLACE FUNCTION public.can_create_chama(_user uuid, _email text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_platform_admin(_user)
     OR EXISTS (
       SELECT 1 FROM public.chair_applications
       WHERE status = 'approved'
         AND lower(email) = lower(COALESCE(_email, ''))
     );
$$;

DROP POLICY IF EXISTS "chamas insert by admin" ON public.chamas;
CREATE POLICY "chamas insert by approved chair" ON public.chamas
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND public.can_create_chama(auth.uid(), auth.jwt() ->> 'email')
  );

-- 4. Clean slate
DELETE FROM public.feed_comments;
DELETE FROM public.feed_posts;
DELETE FROM public.meeting_attendance;
DELETE FROM public.meetings;
DELETE FROM public.loan_guarantors;
DELETE FROM public.loans;
DELETE FROM public.contributions;
DELETE FROM public.investments;
DELETE FROM public.notifications;
DELETE FROM public.transparency_logs;
DELETE FROM public.billing_subscriptions;
DELETE FROM public.chama_invites;
DELETE FROM public.memberships;
DELETE FROM public.chamas;