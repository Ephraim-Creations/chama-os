CREATE OR REPLACE FUNCTION public.feed_posts_guard_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_announcement IS TRUE THEN
    IF auth.role() <> 'service_role'
       AND NOT public.has_chama_role(NEW.chama_id, auth.uid(), 'chairperson'::app_role) THEN
      RAISE EXCEPTION 'only the chairperson can post announcements';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS feed_posts_guard_announcement_ins ON public.feed_posts;
CREATE TRIGGER feed_posts_guard_announcement_ins
BEFORE INSERT ON public.feed_posts
FOR EACH ROW EXECUTE FUNCTION public.feed_posts_guard_announcement();

DROP TRIGGER IF EXISTS feed_posts_guard_announcement_upd ON public.feed_posts;
CREATE TRIGGER feed_posts_guard_announcement_upd
BEFORE UPDATE ON public.feed_posts
FOR EACH ROW EXECUTE FUNCTION public.feed_posts_guard_announcement();