import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Permission, Role } from "@/lib/permissions";
import { can } from "@/lib/permissions";

export async function roleIn(chamaId: string, userId: string): Promise<Role> {
  const { data } = await supabaseAdmin
    .from("memberships")
    .select("role")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("You are not a member of this chama.");
  return data.role as Role;
}

export async function requirePermission(chamaId: string, userId: string, permission: Permission) {
  const role = await roleIn(chamaId, userId);
  if (!can(role, permission)) throw new Error("You do not have permission to do this.");
  return role;
}

export async function insertContribution(
  chamaId: string,
  userId: string,
  input: { memberId: string; type: string; amount: number; notes?: string | null },
) {
  await requirePermission(chamaId, userId, "finance.manage");
  const { error } = await supabaseAdmin.from("contributions").insert({
    chama_id: chamaId,
    member_id: input.memberId,
    type: input.type as any,
    amount: input.amount,
    notes: input.notes ?? null,
    recorded_by: userId,
  });
  if (error) {
    console.error("[records.server] contribution", error);
    throw new Error("Could not record that contribution.");
  }
  return { ok: true };
}

export async function insertLoan(
  chamaId: string,
  userId: string,
  input: { borrowerId: string; amount: number; purpose: string; months: number },
) {
  const role = await roleIn(chamaId, userId);
  const forSomeoneElse = input.borrowerId !== userId;
  if (forSomeoneElse && !can(role, "loans.manage")) {
    throw new Error("Only the treasurer or chairperson can record loans for others.");
  }
  const { error } = await supabaseAdmin.from("loans").insert({
    chama_id: chamaId,
    borrower_id: input.borrowerId,
    amount: input.amount,
    purpose: input.purpose,
    repayment_months: input.months,
    status: forSomeoneElse ? "active" : "pending",
  });
  if (error) {
    console.error("[records.server] loan", error);
    throw new Error("Could not save that loan.");
  }
  return { ok: true };
}

export async function insertMeeting(
  chamaId: string,
  userId: string,
  input: { title: string; agenda?: string | null; location?: string | null; scheduledAt: string },
) {
  await requirePermission(chamaId, userId, "meetings.manage");
  const { error } = await supabaseAdmin.from("meetings").insert({
    chama_id: chamaId,
    title: input.title,
    agenda: input.agenda ?? null,
    location: input.location ?? null,
    scheduled_at: input.scheduledAt,
    created_by: userId,
  });
  if (error) {
    console.error("[records.server] meeting", error);
    throw new Error("Could not schedule that meeting.");
  }
  return { ok: true };
}

export async function insertInvestment(
  chamaId: string,
  userId: string,
  input: {
    name: string;
    category?: string | null;
    initialValue: number;
    currentValue: number;
    monthlyIncome: number;
    notes?: string | null;
  },
) {
  await requirePermission(chamaId, userId, "investments.manage");
  const { error } = await supabaseAdmin.from("investments").insert({
    chama_id: chamaId,
    name: input.name,
    category: input.category ?? null,
    initial_value: input.initialValue,
    current_value: input.currentValue,
    monthly_income: input.monthlyIncome,
    notes: input.notes ?? null,
  });
  if (error) {
    console.error("[records.server] investment", error);
    throw new Error("Could not save that investment.");
  }
  return { ok: true };
}

export async function decideLoan(
  chamaId: string,
  userId: string,
  input: { loanId: string; decision: "approved" | "rejected" | "under_review"; note?: string | null },
) {
  const role = await roleIn(chamaId, userId);
  const isReview = input.decision === "under_review";
  if (isReview) {
    if (!can(role, "loans.manage")) throw new Error("Only the treasurer or chairperson can review loans.");
  } else if (role !== "chairperson") {
    throw new Error("Only the chairperson can approve or reject a loan.");
  }

  const { data: loan } = await supabaseAdmin
    .from("loans")
    .select("id, borrower_id, amount, status")
    .eq("id", input.loanId)
    .eq("chama_id", chamaId)
    .maybeSingle();
  if (!loan) throw new Error("That loan no longer exists.");

  const patch = isReview
    ? { status: "under_review", treasurer_notes: input.note ?? null }
    : {
        status: input.decision === "approved" ? "active" : "rejected",
        chair_notes: input.note ?? null,
        decided_at: new Date().toISOString(),
      };

  const { error } = await supabaseAdmin.from("loans").update(patch as never).eq("id", input.loanId);
  if (error) {
    console.error("[records.server] decideLoan", error);
    throw new Error("Could not update that loan.");
  }

  const title = isReview
    ? "Your loan is under review"
    : input.decision === "approved"
      ? "Loan approved"
      : "Loan application rejected";
  const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
    user_id: loan.borrower_id as string,
    chama_id: chamaId,
    title,
    body: input.note ?? null,
    kind: "loans",
  });
  if (notifyError) console.error("[records.server] decideLoan notify", notifyError);

  return { ok: true };
}
