import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requirePermission, roleIn } from "@/lib/records.server";

const ksh = (n: number) =>
  `Ksh ${Math.round(n).toLocaleString("en-KE")}`;

export async function createDeduction(
  chamaId: string,
  userId: string,
  input: {
    name: string;
    amountPerMember: number;
    notes?: string | null;
    appliedOn?: string | null;
    memberIds: string[];
  },
) {
  await requirePermission(chamaId, userId, "finance.deduct");

  const { data: memberRows, error: memberError } = await supabaseAdmin
    .from("memberships")
    .select("user_id")
    .eq("chama_id", chamaId);
  if (memberError) {
    console.error("[deductions.server] members", memberError);
    throw new Error("Could not load the members of this chama.");
  }
  const allowed = new Set((memberRows ?? []).map((m) => m.user_id as string));
  const targets = Array.from(new Set(input.memberIds)).filter((id) => allowed.has(id));
  if (targets.length === 0) throw new Error("Select at least one member of this chama.");

  const { data: deduction, error } = await supabaseAdmin
    .from("deductions")
    .insert({
      chama_id: chamaId,
      name: input.name,
      amount_per_member: input.amountPerMember,
      notes: input.notes ?? null,
      applied_on: input.appliedOn ?? new Date().toISOString().slice(0, 10),
      created_by: userId,
    })
    .select("id")
    .single();
  if (error || !deduction) {
    console.error("[deductions.server] insert", error);
    throw new Error("Could not save that deduction.");
  }

  const { error: rowsError } = await supabaseAdmin.from("deduction_members").insert(
    targets.map((memberId) => ({
      deduction_id: deduction.id,
      chama_id: chamaId,
      member_id: memberId,
      amount: input.amountPerMember,
    })),
  );
  if (rowsError) {
    console.error("[deductions.server] rows", rowsError);
    await supabaseAdmin.from("deductions").delete().eq("id", deduction.id);
    throw new Error("Could not apply that deduction to the selected members.");
  }

  const { error: notifyError } = await supabaseAdmin.from("notifications").insert(
    targets.map((memberId) => ({
      user_id: memberId,
      chama_id: chamaId,
      title: `Deduction: ${input.name}`,
      body: `${ksh(input.amountPerMember)} was deducted from your savings.`,
      kind: "finance",
    })),
  );
  if (notifyError) console.error("[deductions.server] notify", notifyError);

  return { ok: true, deductionId: deduction.id as string, members: targets.length };
}

export async function removeDeduction(chamaId: string, userId: string, deductionId: string) {
  const role = await roleIn(chamaId, userId);
  if (role !== "chairperson") throw new Error("Only the chairperson can reverse a deduction.");

  const { data: existing } = await supabaseAdmin
    .from("deductions")
    .select("id, name, amount_per_member, notes, applied_on, chama_id")
    .eq("id", deductionId)
    .eq("chama_id", chamaId)
    .maybeSingle();
  if (!existing) throw new Error("That deduction no longer exists.");

  const { error } = await supabaseAdmin
    .from("deductions")
    .delete()
    .eq("id", deductionId)
    .eq("chama_id", chamaId);
  if (error) {
    console.error("[deductions.server] delete", error);
    throw new Error("Could not reverse that deduction.");
  }

  const { error: logError } = await supabaseAdmin.from("transparency_logs").insert({
    chama_id: chamaId,
    table_name: "deductions",
    record_id: deductionId,
    action: "delete",
    previous_value: existing as any,
    new_value: null,
    edited_by: userId,
    reason: "Deduction reversed by chairperson",
  });
  if (logError) console.error("[deductions.server] log", logError);

  return { ok: true };
}
