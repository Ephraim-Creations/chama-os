
CREATE OR REPLACE FUNCTION public.has_chama_role(_chama uuid, _user uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select case
    when auth.role() = 'service_role' or _user = auth.uid() then exists(
      select 1 from public.memberships where chama_id = _chama and user_id = _user and role = _role)
    else false end;
$$;

CREATE OR REPLACE FUNCTION public.is_member_of(_chama uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select case
    when auth.role() = 'service_role' or _user = auth.uid() then exists(
      select 1 from public.memberships where chama_id = _chama and user_id = _user)
    else false end;
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select case
    when auth.role() = 'service_role' or _user = auth.uid() then exists(
      select 1 from public.platform_admins where user_id = _user)
    else false end;
$$;

CREATE OR REPLACE FUNCTION public.shares_chama_with(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  select case
    when auth.role() = 'service_role' or _a = auth.uid() or _b = auth.uid() then exists(
      select 1 from public.memberships m1
      join public.memberships m2 on m1.chama_id = m2.chama_id
      where m1.user_id = _a and m2.user_id = _b)
    else false end;
$$;

REVOKE EXECUTE ON FUNCTION public.has_chama_role(uuid, uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_member_of(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.shares_chama_with(uuid, uuid) FROM PUBLIC, anon;
