import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type {
  CreateChamaInput,
  FindSimilarChamasInput,
  JoinChamaByCodeInput,
  SetMemberRoleInput,
} from "@/lib/chama.schemas";

export const ADMIN_EMAIL = "ephraimcreations254@gmail.com";

function fail(error: unknown, fallback: string): never {
  console.error("[chama.functions]", error);
  throw new Error(fallback);
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export async function findSimilarChamasForUser(
  data: FindSimilarChamasInput,
  supabase: any,
) {
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
    .map((r: any) => {
      const n = normalize(r.name);
      const hits = tokens.filter((t) => n.includes(t)).length;
      const locBonus = wantLoc && r.location && normalize(r.location).includes(wantLoc) ? 1 : 0;
      return { row: r, score: hits + locBonus };
    })
    .filter((x: any) => x.score >= 1)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 4)
    .map((x: any) => ({
      id: x.row.id as string,
      name: x.row.name as string,
      type: x.row.type as string,
      location: (x.row.location as string | null) ?? null,
    }));
}

export async function listChamasForUser(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("memberships")
    .select("role, chama:chamas(id, name, type, location)")
    .eq("user_id", userId);
  if (error) fail(error, "Could not load your chamas.");
  return (data ?? [])
    .filter((r: any) => r.chama)
    .map((r: any) => ({
      id: r.chama.id as string,
      name: r.chama.name as string,
      type: r.chama.type as string,
      location: r.chama.location as string | null,
      role: r.role as string,
    }));
}

export async function createChamaForUser(
  data: CreateChamaInput,
  userId: string,
  rawEmail: string,
) {
  const email = rawEmail.toLowerCase();
  const { data: eligible, error: eligErr } = await supabaseAdmin.rpc("can_create_chama", {
    _user: userId,
    _email: email,
  });
  if (eligErr) fail(eligErr, "Could not verify your access.");
  if (!eligible) {
    throw new Error("Your account isn't approved to open a chama yet. Apply at /join/apply and we'll review it.");
  }

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
  if (mErr) {
    await supabaseAdmin.from("chamas").delete().eq("id", chama.id);
    fail(mErr, "Could not assign chairperson role.");
  }

  const seeded: Array<{ email: string; role: string; token: string }> = [];
  if (data.invites?.length) {
    const seen = new Set<string>();
    const rows = data.invites
      .map((i) => ({ email: i.email.trim().toLowerCase(), role: i.role }))
      .filter((i) => i.email && i.email !== email && !seen.has(i.email) && seen.add(i.email))
      .map((i) => ({ chama_id: chama.id, email: i.email, role: i.role, invited_by: userId }));
    if (rows.length) {
      const { data: inserted, error: inviteErr } = await supabaseAdmin
        .from("chama_invites")
        .insert(rows)
        .select("email, role, token");
      if (inviteErr) console.error("[chama.functions] seed invites", inviteErr);
      if (inserted) seeded.push(...inserted.map((r: any) => ({ email: r.email, role: r.role, token: r.token })));
    }
  }

  if (seeded.length) {
    const { sendSetupInvite } = await import("@/lib/onboarding.server");
    await Promise.allSettled(seeded.map((s) => sendSetupInvite(s.email)));
  }

  return { id: chama.id, invites: seeded };
}

export async function joinChamaWithCode(data: JoinChamaByCodeInput, userId: string) {
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
}

export async function updateMemberRole(data: SetMemberRoleInput, supabase: any) {
  const { error } = await supabase
    .from("memberships")
    .update({ role: data.role })
    .eq("id", data.membershipId)
    .eq("chama_id", data.chamaId);
  if (error) fail(error, "Could not update member role.");
  return { ok: true };
}