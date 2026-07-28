-- 1) Stop exposing the invite token column through the Data API.
REVOKE SELECT (token) ON public.chama_invites FROM anon, authenticated;

-- 2) Lock down SECURITY DEFINER / helper functions.
-- Trigger-only functions: not callable via the API at all.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.memberships_guard_role_assignment() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.chama_invites_guard_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.chamas_guard_update() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.loans_guard_immutable_fields() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Server-only helpers.
REVOKE ALL ON FUNCTION public.can_create_chama(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_chama(uuid, text) TO service_role;

REVOKE ALL ON FUNCTION public.get_chama_invite_code(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chama_invite_code(uuid) TO service_role;

-- Helpers used inside RLS policies: signed-in users only, never anonymous.
REVOKE ALL ON FUNCTION public.has_chama_role(uuid, uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_chama_role(uuid, uuid, app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_member_of(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_member_of(uuid, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_platform_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.shares_chama_with(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.shares_chama_with(uuid, uuid) TO authenticated, service_role;