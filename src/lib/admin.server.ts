import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertPlatformAdmin } from "@/lib/access.server";

export { assertPlatformAdmin };

export type PlatformOverview = {
  chamas: number;
  members: number;
  users: number;
  pendingApplications: number;
  contributionsTotal: number;
  loansTotal: number;
  plans: number;
};

export async function loadOverview(): Promise<PlatformOverview> {
  const [chamas, members, apps, plans, contributions, loans, users] = await Promise.all([
    supabaseAdmin.from("chamas").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("memberships").select("id", { count: "exact", head: true }),
    supabaseAdmin
      .from("chair_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin.from("pricing_plans").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("contributions").select("amount"),
    supabaseAdmin.from("loans").select("amount"),
    supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1 }),
  ]);

  const sum = (rows: Array<{ amount: number | string | null }> | null) =>
    (rows ?? []).reduce((t, r) => t + Number(r.amount ?? 0), 0);

  return {
    chamas: chamas.count ?? 0,
    members: members.count ?? 0,
    users: (users.data as { total?: number } | null)?.total ?? members.count ?? 0,
    pendingApplications: apps.count ?? 0,
    contributionsTotal: sum(contributions.data as never),
    loansTotal: sum(loans.data as never),
    plans: plans.count ?? 0,
  };
}

export type AdminChama = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  created_at: string;
  members: number;
  chair: string | null;
  plan: string;
};

export async function loadChamas(): Promise<AdminChama[]> {
  const { data: chamas, error } = await supabaseAdmin
    .from("chamas")
    .select("id, name, type, location, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin.server] load chamas", error);
    throw new Error("Could not load chamas.");
  }
  const ids = (chamas ?? []).map((c) => c.id);
  if (!ids.length) return [];

  const [{ data: memberships }, { data: profiles }, { data: billing }] = await Promise.all([
    supabaseAdmin.from("memberships").select("chama_id, user_id, role").in("chama_id", ids),
    supabaseAdmin.from("profiles").select("id, full_name"),
    supabaseAdmin.from("billing_subscriptions").select("chama_id, plan").in("chama_id", ids),
  ]);

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name as string | null]));
  const planById = new Map((billing ?? []).map((b) => [b.chama_id, b.plan as string]));

  return (chamas ?? []).map((c) => {
    const rows = (memberships ?? []).filter((m) => m.chama_id === c.id);
    const chair = rows.find((m) => m.role === "chairperson");
    return {
      ...c,
      members: rows.length,
      chair: chair ? (nameById.get(chair.user_id) ?? null) : null,
      plan: planById.get(c.id) ?? "free",
    };
  });
}

export async function broadcast(input: {
  title: string;
  body: string;
  chamaId: string | null;
}): Promise<number> {
  let query = supabaseAdmin.from("memberships").select("user_id");
  if (input.chamaId) query = query.eq("chama_id", input.chamaId);
  const { data, error } = await query;
  if (error) {
    console.error("[admin.server] broadcast recipients", error);
    throw new Error("Could not load recipients.");
  }
  const userIds = Array.from(new Set((data ?? []).map((r) => r.user_id)));
  if (!userIds.length) return 0;

  const rows = userIds.map((user_id) => ({
    user_id,
    chama_id: input.chamaId,
    title: input.title,
    body: input.body,
    kind: "announcement",
  }));
  const { error: insErr } = await supabaseAdmin.from("notifications").insert(rows);
  if (insErr) {
    console.error("[admin.server] broadcast insert", insErr);
    throw new Error("Could not send the announcement.");
  }
  return rows.length;
}
