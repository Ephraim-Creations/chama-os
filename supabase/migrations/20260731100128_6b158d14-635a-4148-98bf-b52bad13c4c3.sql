CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  device_type text NOT NULL DEFAULT 'desktop',
  browser text NOT NULL DEFAULT 'Other',
  country text,
  visitor_id text,
  session_id text,
  consented boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can read page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (public.is_platform_admin(auth.uid()));

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx ON public.page_views (path);