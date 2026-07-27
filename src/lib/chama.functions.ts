import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  createChamaSchema,
  findSimilarChamasSchema,
  joinChamaByCodeSchema,
  setMemberRoleSchema,
} from "@/lib/chama.schemas";
import {
  ADMIN_EMAIL,
  createChamaForUser,
  findSimilarChamasForUser,
  joinChamaWithCode,
  listChamasForUser,
  updateMemberRole,
} from "@/lib/chama.server";

export { ADMIN_EMAIL };

/**
 * Public-records lookup for the create flow. Returns a tiny, safe payload so
 * the chair can spot a duplicate before creating a new chama. No emails, no
 * member counts, no invite codes — just enough to recognise it.
 */
export const findSimilarChamas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => findSimilarChamasSchema.parse(input))
  .handler(async ({ data, context }) => {
    return findSimilarChamasForUser(data, context.supabase);
  });

export const listMyChamas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return listChamasForUser(context.supabase, context.userId);
  });

export const createChama = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createChamaSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = String((claims as any)?.email ?? "").toLowerCase();
    return createChamaForUser(data, userId, email);
  });

export const joinChamaByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => joinChamaByCodeSchema.parse(input))
  .handler(async ({ data, context }) => {
    return joinChamaWithCode(data, context.userId);
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => setMemberRoleSchema.parse(input))
  .handler(async ({ data, context }) => {
    return updateMemberRole(data, context.supabase);
  });
