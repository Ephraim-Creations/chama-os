import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ChamaSubscription = {
  plan: string;
  status: string;
  renews_at: string | null;
};

/** Reads the subscription for a chama the caller actually belongs to. */
export async function loadChamaSubscription(
  chamaId: string,
  userId: string,
): Promise<ChamaSubscription | null> {
  const { data: membership, error: mErr } = await supabaseAdmin
    .from("memberships")
    .select("id")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (mErr) {
    console.error("[billing.server] membership check", mErr);
    throw new Error("Could not load billing details.");
  }
  if (!membership) throw new Error("You do not have access to this chama.");

  const { data, error } = await supabaseAdmin
    .from("billing_subscriptions")
    .select("plan, status, renews_at")
    .eq("chama_id", chamaId)
    .maybeSingle();
  if (error) {
    console.error("[billing.server] load subscription", error);
    throw new Error("Could not load billing details.");
  }
  return data ?? null;
}
