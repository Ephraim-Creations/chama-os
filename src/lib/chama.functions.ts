import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const chamaTypes = [
  "investment", "welfare", "sacco", "table_banking",
  "women", "men", "youth", "church", "community",
] as const;
const roles = ["chairperson", "treasurer", "secretary", "member"] as const;

export const ADMIN_EMAIL = "ephraimcreations254@gmail.com";

function fail(error: unknown, fallback: string): never {
  console.error("[chama.functions]", error);
  throw new Error(fallback);
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Public-records lookup for the create flow. Returns a tiny, safe payload so
 * the chair can spot a duplicate before creating a new chama. No emails, no
 * member counts, no invite codes — just enough to recognise it.
 */
export const findSimilarChamas = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      name: z.string().min(2).max(120),
      location: z.string().max(200).optional().nullable(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    // Use the user-scoped client so RLS limits results to chamas the caller
    // is already a member of. This prevents enumeration of other groups.
    const { supabase } = context;
    const q = normalize(data.name);
    if (q.length < 3) return [] as Array<{ id: string; name: string; type: string; location: string | null }>;
    const tokens = q.split(" ").filter((t) => t.length >= 3).slice(0, 3);
    if (tokens.length === 0) return [];

    const orExpr = tokens.map((t) => `name.ilike.%${t}%`).join(",");
    const { data: rows, error } = await supabase
      .from("chamas")
      .select("id, name, type, location")
      .or(orExpr)
      .limit(8);
    if (error) return [];

    const wantLoc = data.location ? normalize(data.location) : "";
    return (rows ?? [])
      .map((r) => {
        const n = normalize(r.name);
        const hits = tokens.filter((t) => n.includes(t)).length;
        const locBonus = wantLoc && r.location && normalize(r.location).includes(wantLoc) ? 1 : 0;
        return { row: r, score: hits + locBonus };
      })
      .filter((x) => x.score >= 1)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => ({
        id: x.row.id as string,
        name: x.row.name as string,
        type: x.row.type as string,
        location: (x.row.location as string | null) ?? null,
      }));
  });

export const listMyChamas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("memberships")
      .select("role, chama:chamas(id, name, type, location)")
      .eq("user_id", userId);
    if (error) fail(error, "Could not load your chamas.");
    return (data ?? [])
      .filter((r) => r.chama)
      .map((r) => ({
        id: (r.chama as any).id as string,
        name: (r.chama as any).name as string,
        type: (r.chama as any).type as string,
        location: (r.chama as any).location as string | null,
        role: r.role as string,
      }));
  });

const rulesSchema = z.object({
  contribution_amount: z.number().min(0).max(10_000_000).default(0),
  contribution_frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).default("monthly"),
  late_penalty: z.number().min(0).max(1_000_000).default(0),
  meeting_cadence: z.enum(["weekly", "biweekly", "monthly", "quarterly"]).default("monthly"),
  meeting_day: z.string().max(40).default(""),
  quorum_percent: z.number().min(1).max(100).default(50),
  loan_approval_threshold: z.number().min(1).max(100).default(50),
  currency: z.string().min(2).max(8).default("KES"),
}).partial();

const inviteSeedSchema = z.object({
  email: z.string().email().max(255),
  role: z.enum(roles).default("member"),
});

export const createChama = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      name: z.string().min(2).max(120),
      type: z.enum(chamaTypes),
      location: z.string().max(200).optional().nullable(),
      rules: rulesSchema.optional(),
      invites: z.array(inviteSeedSchema).max(50).optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;
    const email = String((claims as any)?.email ?? "").toLowerCase();

    // Any signed-in user may create a chama and becomes its chairperson.
    // Use admin client for the bootstrap: the chair must exist as a membership
    // row before any chair-scoped RLS policy will allow further writes.
    const { data: chama, error } = await supabaseAdmin
      .from("chamas")
      .insert({
        name: data.name,
        type: data.type,
        location: data.location ?? null,
        created_by: userId,
        rules: data.rules ?? {},
      })
      .select("id")
      .single();
    if (error || !chama) fail(error, "Could not create chama.");

    const { error: mErr } = await supabaseAdmin
      .from("memberships")
      .insert({ chama_id: chama.id, user_id: userId, role: "chairperson" });
    if (mErr) fail(mErr, "Could not assign chairperson role.");

    // Seed initial invites (dedup by lowercased email).
    const seeded: Array<{ email: string; role: string; token: string }> = [];
    if (data.invites?.length) {
      const seen = new Set<string>();
      const rows = data.invites
        .map((i) => ({ email: i.email.trim().toLowerCase(), role: i.role }))
        .filter((i) => i.email && i.email !== email && !seen.has(i.email) && seen.add(i.email))
        .map((i) => ({ chama_id: chama.id, email: i.email, role: i.role, invited_by: userId }));
      if (rows.length) {
        const { data: inserted } = await supabaseAdmin
          .from("chama_invites")
          .insert(rows)
          .select("email, role, token");
        if (inserted) seeded.push(...inserted.map((r: any) => ({ email: r.email, role: r.role, token: r.token })));
      }
    }

    return { id: chama.id, invites: seeded };
  });

export const joinChamaByCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ code: z.string().min(4).max(32).regex(/^[A-Za-z0-9_-]+$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const code = data.code.toUpperCase();

    const { data: chama, error } = await supabaseAdmin
      .from("chamas")
      .select("id, name")
      .eq("invite_code", code)
      .maybeSingle();
    if (error) fail(error, "Could not look up that invite code.");
    if (!chama) throw new Error("Invite code not found");

    const { data: existing } = await supabaseAdmin
      .from("memberships")
      .select("id")
      .eq("chama_id", chama.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) return { id: chama.id, alreadyMember: true };

    const { error: mErr } = await supabaseAdmin
      .from("memberships")
      .insert({ chama_id: chama.id, user_id: userId, role: "member" });
    if (mErr) fail(mErr, "Could not join chama.");

    return { id: chama.id, alreadyMember: false };
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      chamaId: z.string().uuid(),
      membershipId: z.string().uuid(),
      role: z.enum(roles),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("memberships")
      .update({ role: data.role })
      .eq("id", data.membershipId)
      .eq("chama_id", data.chamaId);
    if (error) fail(error, "Could not update member role.");
    return { ok: true };
  });
