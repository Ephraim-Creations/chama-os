import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const roles = ["chairperson", "treasurer", "secretary", "member"] as const;

function fail(error: unknown, fallback: string): never {
  console.error("[invites.functions]", error);
  throw new Error(fallback);
}

async function assertChair(chamaId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("memberships")
    .select("role")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) fail(error, "Permission check failed.");
  if (!data || data.role !== "chairperson") throw new Error("Only the chairperson can do this");
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("[invites.functions] listUsers", error);
      return null;
    }
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      chamaId: z.string().uuid(),
      email: z.string().email().max(255),
      role: z.enum(roles).default("member"),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    await assertChair(data.chamaId, userId);
    const email = data.email.trim().toLowerCase();

    const { sendSetupInvite } = await import("@/lib/onboarding.server");

    // Already a member of this chama?
    const existingUserId = await findUserIdByEmail(email);
    if (existingUserId) {
      const { data: member } = await supabaseAdmin
        .from("memberships")
        .select("id")
        .eq("chama_id", data.chamaId)
        .eq("user_id", existingUserId)
        .maybeSingle();
      if (member) {
        throw new Error(`${email} is already a member of this chama.`);
      }
    }

    const { data: existing } = await supabaseAdmin
      .from("chama_invites")
      .select("id, token")
      .eq("chama_id", data.chamaId)
      .ilike("email", email)
      .eq("status", "pending")
      .maybeSingle();
    if (existing) {
      const resent = await sendSetupInvite(email);
      return { id: existing.id, token: existing.token, alreadyExisted: true, emailed: resent.sent };
    }

    const { data: inv, error } = await supabaseAdmin
      .from("chama_invites")
      .insert({ chama_id: data.chamaId, email, role: data.role, invited_by: userId })
      .select("id, token")
      .single();
    if (error || !inv) fail(error, "Could not create invite.");

    const sent = await sendSetupInvite(email);
    return { id: inv.id, token: inv.token, alreadyExisted: false, emailed: sent.sent };
  });

export const listChamaInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ chamaId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    await assertChair(data.chamaId, userId);
    const { data: rows, error } = await supabaseAdmin
      .from("chama_invites")
      .select("id, email, role, status, token, created_at")
      .eq("chama_id", data.chamaId)
      .order("created_at", { ascending: false });
    if (error) fail(error, "Could not load invites.");
    return rows ?? [];
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ inviteId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: inv } = await supabaseAdmin
      .from("chama_invites")
      .select("chama_id")
      .eq("id", data.inviteId)
      .single();
    if (!inv) throw new Error("Invite not found");
    await assertChair(inv.chama_id, userId);
    const { error } = await supabaseAdmin
      .from("chama_invites")
      .update({ status: "revoked" })
      .eq("id", data.inviteId);
    if (error) fail(error, "Could not revoke invite.");
    return { ok: true };
  });

export const acceptAllMyInvites = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context as { userId: string; claims: { email?: string } };
    const email = (claims?.email ?? "").trim().toLowerCase();
    if (!email) return { accepted: 0 };

    const { data: invites, error } = await supabaseAdmin
      .from("chama_invites")
      .select("id, chama_id, role")
      .ilike("email", email)
      .eq("status", "pending");
    if (error) fail(error, "Could not check invites.");
    if (!invites?.length) return { accepted: 0 };

    let accepted = 0;
    for (const inv of invites) {
      const { data: already } = await supabaseAdmin
        .from("memberships")
        .select("id")
        .eq("chama_id", inv.chama_id)
        .eq("user_id", userId)
        .maybeSingle();
      if (!already) {
        const { error: mErr } = await supabaseAdmin
          .from("memberships")
          .insert({ chama_id: inv.chama_id, user_id: userId, role: inv.role });
        if (mErr) { console.error("[invites.functions] accept insert", mErr); continue; }
      }
      await supabaseAdmin
        .from("chama_invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", inv.id);
      accepted++;
    }
    return { accepted };
  });
