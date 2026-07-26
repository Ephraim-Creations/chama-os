import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AccessStatus = {
  email: string;
  memberships: number;
  canCreateChama: boolean;
  isPlatformAdmin: boolean;
  application: { status: string; chama_name: string } | null;
};

/** Turn every pending invite for this email into a real membership. */
export async function acceptPendingInvites(userId: string, email: string) {
  if (!email) return 0;
  const { data: invites, error } = await supabaseAdmin
    .from("chama_invites")
    .select("id, chama_id, role")
    .ilike("email", email)
    .eq("status", "pending");
  if (error || !invites?.length) return 0;

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
      if (mErr) {
        console.error("[access.server] accept invite", mErr);
        continue;
      }
    }
    await supabaseAdmin
      .from("chama_invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inv.id);
    accepted++;
  }
  return accepted;
}

export async function computeAccess(userId: string, rawEmail: string): Promise<AccessStatus> {
  const email = (rawEmail ?? "").trim().toLowerCase();
  await acceptPendingInvites(userId, email);

  const [{ count }, adminRow, appRow] = await Promise.all([
    supabaseAdmin
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabaseAdmin.from("platform_admins").select("user_id").eq("user_id", userId).maybeSingle(),
    supabaseAdmin
      .from("chair_applications")
      .select("status, chama_name")
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const isPlatformAdmin = Boolean(adminRow.data);
  const application = (appRow.data as { status: string; chama_name: string } | null) ?? null;

  return {
    email,
    memberships: count ?? 0,
    isPlatformAdmin,
    canCreateChama: isPlatformAdmin || application?.status === "approved",
    application,
  };
}

export async function assertPlatformAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Not authorised");
}
