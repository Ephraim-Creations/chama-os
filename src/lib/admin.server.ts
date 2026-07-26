import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertPlatformAdmin } from "@/lib/access.server";

export { assertPlatformAdmin };

export type PlatformOverview = {
  chamas: number;
  activeChamas: number;
  suspendedChamas: number;
  newThisMonth: number;
  pendingApplications: number;
  plans: number;
  planMix: Array<{ plan: string; groups: number }>;
};

/**
 * Platform-level counts only. By design this never reads member identities or
 * any per-member financial record — the platform admin sees groups, not people.
 */
export async function loadOverview(): Promise<PlatformOverview> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [chamas, apps, plans, billing] = await Promise.all([
    supabaseAdmin.from("chamas").select("id, status, created_at"),
    supabaseAdmin
      .from("chair_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabaseAdmin.from("pricing_plans").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("billing_subscriptions").select("chama_id, plan"),
  ]);

  const rows = (chamas.data ?? []) as Array<{ id: string; status: string; created_at: string }>;
  const planById = new Map((billing.data ?? []).map((b) => [b.chama_id, b.plan as string]));
  const mix = new Map<string, number>();
  for (const c of rows) {
    const plan = planById.get(c.id) ?? "free";
    mix.set(plan, (mix.get(plan) ?? 0) + 1);
  }

  return {
    chamas: rows.length,
    activeChamas: rows.filter((c) => c.status !== "suspended").length,
    suspendedChamas: rows.filter((c) => c.status === "suspended").length,
    newThisMonth: rows.filter((c) => new Date(c.created_at) >= monthStart).length,
    pendingApplications: apps.count ?? 0,
    plans: plans.count ?? 0,
    planMix: Array.from(mix, ([plan, groups]) => ({ plan, groups })).sort(
      (a, b) => b.groups - a.groups,
    ),
  };
}

export type AdminChama = {
  id: string;
  name: string;
  type: string;
  location: string | null;
  created_at: string;
  status: string;
  members: number;
  plan: string;
  billing_status: string;
  renews_at: string | null;
};

/** Group-level directory. No member names or emails are ever selected here. */
export async function loadChamas(): Promise<AdminChama[]> {
  const { data: chamas, error } = await supabaseAdmin
    .from("chamas")
    .select("id, name, type, location, created_at, status")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[admin.server] load chamas", error);
    throw new Error("Could not load chamas.");
  }
  const ids = (chamas ?? []).map((c) => c.id);
  if (!ids.length) return [];

  const [{ data: memberships }, { data: billing }] = await Promise.all([
    supabaseAdmin.from("memberships").select("chama_id").in("chama_id", ids),
    supabaseAdmin
      .from("billing_subscriptions")
      .select("chama_id, plan, status, renews_at")
      .in("chama_id", ids),
  ]);

  const billingById = new Map((billing ?? []).map((b) => [b.chama_id, b]));

  return (chamas ?? []).map((c) => {
    const b = billingById.get(c.id);
    return {
      ...c,
      members: (memberships ?? []).filter((m) => m.chama_id === c.id).length,
      plan: b?.plan ?? "free",
      billing_status: b?.status ?? "none",
      renews_at: b?.renews_at ?? null,
    };
  });
}

export async function setChamaPlan(input: {
  chamaId: string;
  plan: string;
  status: string;
  renewsAt: string | null;
}) {
  const { error } = await supabaseAdmin.from("billing_subscriptions").upsert(
    {
      chama_id: input.chamaId,
      plan: input.plan,
      status: input.status,
      renews_at: input.renewsAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "chama_id" },
  );
  if (error) {
    console.error("[admin.server] set plan", error);
    throw new Error("Could not update the plan.");
  }
  return { ok: true };
}

export async function setChamaStatus(chamaId: string, status: "active" | "suspended") {
  const { error } = await supabaseAdmin.from("chamas").update({ status }).eq("id", chamaId);
  if (error) {
    console.error("[admin.server] set status", error);
    throw new Error("Could not update the group status.");
  }
  return { ok: true };
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
