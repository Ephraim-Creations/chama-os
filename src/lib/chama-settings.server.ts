import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SaveChamaSettingsInput } from "@/lib/chama.schemas";

export type ChamaRules = {
  contribution_amount?: number;
  contribution_frequency?: string;
  late_penalty?: number;
  meeting_cadence?: string;
  meeting_day?: string;
  quorum_percent?: number;
  loan_approval_threshold?: number;
  currency?: string;
  description?: string;
  founded_year?: number | null;
  joining_fee?: number;
  loan_interest_rate?: number;
  loan_max_multiplier?: number;
};

async function assertChair(chamaId: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from("memberships")
    .select("role")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error("[chama-settings.server] role lookup", error);
    throw new Error("Could not verify your role.");
  }
  if (data?.role !== "chairperson") throw new Error("Only the chairperson can edit chama settings.");
}

export async function loadChamaSettings(chamaId: string, userId: string) {
  const { data: membership } = await supabaseAdmin
    .from("memberships")
    .select("role")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!membership) throw new Error("You are not a member of this chama.");

  const { data, error } = await supabaseAdmin
    .from("chamas")
    .select("id, name, type, location, rules, created_at")
    .eq("id", chamaId)
    .maybeSingle();
  if (error || !data) {
    console.error("[chama-settings.server] load", error);
    throw new Error("Could not load chama settings.");
  }
  return {
    ...data,
    rules: (data.rules ?? {}) as ChamaRules,
    canEdit: membership.role === "chairperson",
  };
}

export async function saveChamaSettings(data: SaveChamaSettingsInput, userId: string) {
  await assertChair(data.chamaId, userId);

  const { data: current } = await supabaseAdmin
    .from("chamas")
    .select("rules")
    .eq("id", data.chamaId)
    .maybeSingle();

  const rules = { ...((current?.rules ?? {}) as ChamaRules), ...(data.rules ?? {}) };

  const { error } = await supabaseAdmin
    .from("chamas")
    .update({
      name: data.name.trim(),
      type: data.type,
      location: data.location?.trim() || null,
      rules,
    })
    .eq("id", data.chamaId);
  if (error) {
    console.error("[chama-settings.server] save", error);
    throw new Error("Could not save chama settings.");
  }
  return { ok: true };
}
