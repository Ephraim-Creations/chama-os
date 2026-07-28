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


/** Append a row to the chama's activity (transparency) log. Never throws. */
export async function logChange(input: {
  chamaId: string;
  table: string;
  recordId: string;
  action: "create" | "update" | "delete";
  previous?: unknown;
  next?: unknown;
  userId: string;
  reason?: string | null;
}) {
  const { error } = await supabaseAdmin.from("transparency_logs").insert({
    chama_id: input.chamaId,
    table_name: input.table,
    record_id: input.recordId,
    action: input.action,
    previous_value: (input.previous ?? null) as any,
    new_value: (input.next ?? null) as any,
    edited_by: input.userId,
    reason: input.reason ?? null,
  });
  if (error) console.error("[records.server] logChange", error);
}

export async function insertContribution(
  chamaId: string,
  userId: string,
  input: { memberId: string; type: string; amount: number; notes?: string | null },
) {
  await requirePermission(chamaId, userId, "finance.manage");
  const { data: row, error } = await supabaseAdmin
    .from("contributions")
    .insert({
      chama_id: chamaId,
      member_id: input.memberId,
      type: input.type as any,
      amount: input.amount,
      notes: input.notes ?? null,
      recorded_by: userId,
    })
    .select("id, member_id, type, amount, notes")
    .single();
  if (error || !row) {
    console.error("[records.server] contribution", error);
    throw new Error("Could not record that contribution.");
  }
  await logChange({
    chamaId,
    table: "contributions",
    recordId: row.id as string,
    action: "create",
    next: row,
    userId,
    reason: input.notes ?? null,
  });
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
  const { data: row, error } = await supabaseAdmin
    .from("loans")
    .insert({
      chama_id: chamaId,
      borrower_id: input.borrowerId,
      amount: input.amount,
      purpose: input.purpose,
      repayment_months: input.months,
      status: forSomeoneElse ? "active" : "pending",
    })
    .select("id, borrower_id, amount, purpose, repayment_months, status")
    .single();
  if (error || !row) {
    console.error("[records.server] loan", error);
    throw new Error("Could not save that loan.");
  }
  await logChange({
    chamaId,
    table: "loans",
    recordId: row.id as string,
    action: "create",
    next: row,
    userId,
    reason: input.purpose,
  });
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
  const { data: row, error } = await supabaseAdmin
    .from("investments")
    .insert({
    chama_id: chamaId,
    name: input.name,
    category: input.category ?? null,
    initial_value: input.initialValue,
    current_value: input.currentValue,
    monthly_income: input.monthlyIncome,
    notes: input.notes ?? null,
    })
    .select("id, name, category, initial_value, current_value, monthly_income")
    .single();
  if (error || !row) {
    console.error("[records.server] investment", error);
    throw new Error("Could not save that investment.");
  }
  await logChange({
    chamaId,
    table: "investments",
    recordId: row.id as string,
    action: "create",
    next: row,
    userId,
    reason: input.notes ?? null,
  });
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

  await logChange({
    chamaId,
    table: "loans",
    recordId: input.loanId,
    action: "update",
    previous: { status: loan.status, amount: loan.amount, borrower_id: loan.borrower_id },
    next: { ...patch, amount: loan.amount, borrower_id: loan.borrower_id },
    userId,
    reason: input.note ?? null,
  });

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

export async function setLoanPlan(
  chamaId: string,
  userId: string,
  input: {
    loanId: string;
    startDate?: string | null;
    installmentAmount?: number | null;
    frequency?: string | null;
    planNotes?: string | null;
    months?: number | null;
  },
) {
  await requirePermission(chamaId, userId, "loans.manage");

  const { data: loan } = await supabaseAdmin
    .from("loans")
    .select("id, borrower_id")
    .eq("id", input.loanId)
    .eq("chama_id", chamaId)
    .maybeSingle();
  if (!loan) throw new Error("That loan no longer exists.");

  const { error } = await supabaseAdmin
    .from("loans")
    .update({
      start_date: input.startDate ?? null,
      installment_amount: input.installmentAmount ?? null,
      frequency: input.frequency ?? null,
      plan_notes: input.planNotes ?? null,
      ...(input.months ? { repayment_months: input.months } : {}),
    } as never)
    .eq("id", input.loanId);
  if (error) {
    console.error("[records.server] setLoanPlan", error);
    throw new Error("Could not save that payment plan.");
  }

  await logChange({
    chamaId,
    table: "loans",
    recordId: input.loanId,
    action: "update",
    next: {
      start_date: input.startDate ?? null,
      installment_amount: input.installmentAmount ?? null,
      frequency: input.frequency ?? null,
      borrower_id: loan.borrower_id,
    },
    userId,
    reason: input.planNotes ?? "Payment plan updated",
  });

  const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
    user_id: loan.borrower_id as string,
    chama_id: chamaId,
    title: "Your loan payment plan was updated",
    body: input.planNotes ?? null,
    kind: "loan",
  });
  if (notifyError) console.error("[records.server] setLoanPlan notify", notifyError);

  return { ok: true };
}

export async function addLoanRepayment(
  chamaId: string,
  userId: string,
  input: { loanId: string; amount: number; paidOn: string; note?: string | null },
) {
  await requirePermission(chamaId, userId, "loans.manage");

  const { data: loan } = await supabaseAdmin
    .from("loans")
    .select("id, borrower_id, amount")
    .eq("id", input.loanId)
    .eq("chama_id", chamaId)
    .maybeSingle();
  if (!loan) throw new Error("That loan no longer exists.");

  const { data: repayment, error } = await supabaseAdmin
    .from("loan_repayments")
    .insert({
      loan_id: input.loanId,
      chama_id: chamaId,
      amount: input.amount,
      paid_on: input.paidOn,
      note: input.note ?? null,
      recorded_by: userId,
    })
    .select("id, loan_id, amount, paid_on, note")
    .single();
  if (error) {
    console.error("[records.server] addLoanRepayment", error);
    throw new Error("Could not record that payment.");
  }

  await logChange({
    chamaId,
    table: "loan_repayments",
    recordId: (repayment?.id as string) ?? input.loanId,
    action: "create",
    next: { loan_id: input.loanId, amount: input.amount, paid_on: input.paidOn, borrower_id: loan.borrower_id },
    userId,
    reason: input.note ?? null,
  });

  const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
    user_id: loan.borrower_id as string,
    chama_id: chamaId,
    title: "Loan payment recorded",
    body: `A payment of Ksh ${input.amount.toLocaleString()} was recorded on your loan.`,
    kind: "loan",
  });
  if (notifyError) console.error("[records.server] addLoanRepayment notify", notifyError);

  return { ok: true };
}

export async function removeLoanRepayment(
  chamaId: string,
  userId: string,
  input: { repaymentId: string },
) {
  await requirePermission(chamaId, userId, "loans.manage");
  const { data: existing } = await supabaseAdmin
    .from("loan_repayments")
    .select("id, loan_id, amount, paid_on, note")
    .eq("id", input.repaymentId)
    .eq("chama_id", chamaId)
    .maybeSingle();
  const { error } = await supabaseAdmin
    .from("loan_repayments")
    .delete()
    .eq("id", input.repaymentId)
    .eq("chama_id", chamaId);
  if (error) {
    console.error("[records.server] removeLoanRepayment", error);
    throw new Error("Could not remove that payment.");
  }
  await logChange({
    chamaId,
    table: "loan_repayments",
    recordId: input.repaymentId,
    action: "delete",
    previous: existing,
    userId,
    reason: "Payment removed",
  });
  return { ok: true };
}
