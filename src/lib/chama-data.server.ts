import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type SnapshotMember = {
  id: string;
  userId: string;
  name: string;
  displayName: string;
  avatarUrl: string | null;
  role: "chairperson" | "treasurer" | "secretary" | "member";
  joinedAt: string;
  savings: number;
  deductions: number;
  contributions: number;
  activeLoans: number;
};

export type ChamaSnapshot = {
  chamaId: string;
  members: SnapshotMember[];
  contributions: Array<{
    id: string;
    memberId: string;
    memberName: string;
    type: string;
    amount: number;
    notes: string | null;
    recordedAt: string;
  }>;
  loans: Array<{
    id: string;
    borrowerId: string;
    borrowerName: string;
    amount: number;
    amountRepaid: number;
    purpose: string;
    status: string;
    months: number;
    appliedAt: string;
    startDate: string | null;
    installmentAmount: number | null;
    frequency: string | null;
    planNotes: string | null;
    treasurerNotes: string | null;
    chairNotes: string | null;
    repayments: Array<{
      id: string;
      amount: number;
      paidOn: string;
      note: string | null;
    }>;
  }>;

  deductions: Array<{
    id: string;
    name: string;
    amountPerMember: number;
    notes: string | null;
    appliedOn: string;
    total: number;
    members: Array<{ memberId: string; memberName: string; amount: number }>;
  }>;
  investments: Array<{
    id: string;
    name: string;
    category: string | null;
    initialValue: number;
    currentValue: number;
    monthlyIncome: number;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    agenda: string | null;
    location: string | null;
    scheduledAt: string;
    minutes: string | null;
  }>;
  totals: {
    members: number;
    savings: number;
    monthlyCollection: number;
    activeLoanValue: number;
    investmentValue: number;
    deductionsTotal: number;
    pendingLoans: number;
  };
  monthly: Array<{ month: string; amount: number }>;
  breakdown: Array<{ name: string; value: number }>;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Everything a chama dashboard needs, computed from real rows only. */
export async function buildSnapshot(chamaId: string, userId: string): Promise<ChamaSnapshot> {
  const { data: mine } = await supabaseAdmin
    .from("memberships")
    .select("id")
    .eq("chama_id", chamaId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!mine) throw new Error("You are not a member of this chama.");

  const [mRes, cRes, lRes, iRes, mtRes, dRes, dmRes] = await Promise.all([
    supabaseAdmin
      .from("memberships")
      .select("id, user_id, role, joined_at")
      .eq("chama_id", chamaId)
      .order("joined_at", { ascending: true }),
    supabaseAdmin
      .from("contributions")
      .select("id, member_id, type, amount, notes, recorded_at")
      .eq("chama_id", chamaId)
      .order("recorded_at", { ascending: false })
      .limit(500),
    supabaseAdmin
      .from("loans")
      .select("id, borrower_id, amount, amount_repaid, purpose, status, repayment_months, applied_at")
      .eq("chama_id", chamaId)
      .order("applied_at", { ascending: false }),
    supabaseAdmin
      .from("investments")
      .select("id, name, category, initial_value, current_value, monthly_income")
      .eq("chama_id", chamaId)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("meetings")
      .select("id, title, agenda, location, scheduled_at, minutes")
      .eq("chama_id", chamaId)
      .order("scheduled_at", { ascending: false }),
    supabaseAdmin
      .from("deductions")
      .select("id, name, amount_per_member, notes, applied_on, created_at")
      .eq("chama_id", chamaId)
      .order("applied_on", { ascending: false }),
    supabaseAdmin
      .from("deduction_members")
      .select("id, deduction_id, member_id, amount")
      .eq("chama_id", chamaId),
  ]);

  const memberRows = mRes.data ?? [];
  const ids = memberRows.map((m) => m.user_id as string);
  const { data: profiles } = ids.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", ids)
    : { data: [] as any[] };

  const profileById = new Map((profiles ?? []).map((p: any) => [p.id as string, p]));
  const contributions = cRes.data ?? [];
  const loans = lRes.data ?? [];
  const investments = iRes.data ?? [];

  const savingsByMember = new Map<string, number>();
  const countByMember = new Map<string, number>();
  for (const c of contributions) {
    const amt = Number(c.amount ?? 0);
    const signed = c.type === "withdrawal" ? -amt : amt;
    savingsByMember.set(c.member_id as string, (savingsByMember.get(c.member_id as string) ?? 0) + signed);
    countByMember.set(c.member_id as string, (countByMember.get(c.member_id as string) ?? 0) + 1);
  }

  const deductionRows = dmRes.data ?? [];
  const deductionsByMember = new Map<string, number>();
  for (const d of deductionRows) {
    const k = d.member_id as string;
    deductionsByMember.set(k, (deductionsByMember.get(k) ?? 0) + Number(d.amount ?? 0));
  }
  const deductionsTotal = deductionRows.reduce((a, d) => a + Number(d.amount ?? 0), 0);

  const activeLoanByMember = new Map<string, number>();
  for (const l of loans) {
    if (["active", "approved", "overdue"].includes(l.status as string)) {
      const k = l.borrower_id as string;
      activeLoanByMember.set(k, (activeLoanByMember.get(k) ?? 0) + 1);
    }
  }

  const nameOf = (userIdKey: string) => {
    const p = profileById.get(userIdKey);
    return (p?.display_name as string) || (p?.full_name as string) || "Member";
  };

  const members: SnapshotMember[] = memberRows.map((m: any) => ({
    id: m.id as string,
    userId: m.user_id as string,
    name: (profileById.get(m.user_id)?.full_name as string) ?? "Member",
    displayName: nameOf(m.user_id),
    avatarUrl: (profileById.get(m.user_id)?.avatar_url as string | null) ?? null,
    role: m.role,
    joinedAt: m.joined_at as string,
    savings:
      (savingsByMember.get(m.user_id as string) ?? 0) -
      (deductionsByMember.get(m.user_id as string) ?? 0),
    deductions: deductionsByMember.get(m.user_id as string) ?? 0,
    contributions: countByMember.get(m.user_id as string) ?? 0,
    activeLoans: activeLoanByMember.get(m.user_id as string) ?? 0,
  }));

  const now = new Date();
  const monthKeys: Array<{ key: string; month: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()] });
  }
  const monthTotals = new Map(monthKeys.map((m) => [m.key, 0]));
  const breakdownMap = new Map<string, number>();
  let monthlyCollection = 0;
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;

  for (const c of contributions) {
    const d = new Date(c.recorded_at as string);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const amt = Number(c.amount ?? 0);
    if (monthTotals.has(key)) monthTotals.set(key, (monthTotals.get(key) ?? 0) + amt);
    if (key === thisMonthKey) monthlyCollection += amt;
    breakdownMap.set(c.type as string, (breakdownMap.get(c.type as string) ?? 0) + amt);
  }

  const totalSavings = contributions.reduce(
    (a, c) => a + (c.type === "withdrawal" ? -Number(c.amount ?? 0) : Number(c.amount ?? 0)),
    0,
  );
  const activeLoanValue = loans
    .filter((l) => ["active", "approved", "overdue"].includes(l.status as string))
    .reduce((a, l) => a + (Number(l.amount ?? 0) - Number(l.amount_repaid ?? 0)), 0);

  return {
    chamaId,
    members,
    contributions: contributions.map((c: any) => ({
      id: c.id,
      memberId: c.member_id,
      memberName: nameOf(c.member_id),
      type: c.type,
      amount: Number(c.amount ?? 0),
      notes: c.notes ?? null,
      recordedAt: c.recorded_at,
    })),
    loans: loans.map((l: any) => ({
      id: l.id,
      borrowerId: l.borrower_id,
      borrowerName: nameOf(l.borrower_id),
      amount: Number(l.amount ?? 0),
      amountRepaid: Number(l.amount_repaid ?? 0),
      purpose: l.purpose,
      status: l.status,
      months: l.repayment_months,
      appliedAt: l.applied_at,
      startDate: l.start_date ?? null,
      installmentAmount: l.installment_amount === null || l.installment_amount === undefined ? null : Number(l.installment_amount),
      frequency: l.frequency ?? null,
      planNotes: l.plan_notes ?? null,
      treasurerNotes: l.treasurer_notes ?? null,
      chairNotes: l.chair_notes ?? null,
      repayments: repaymentRows
        .filter((r: any) => r.loan_id === l.id)
        .map((r: any) => ({
          id: r.id as string,
          amount: Number(r.amount ?? 0),
          paidOn: r.paid_on as string,
          note: (r.note ?? null) as string | null,
        })),
    })),

    deductions: (dRes.data ?? []).map((d: any) => {
      const rows = deductionRows.filter((r: any) => r.deduction_id === d.id);
      return {
        id: d.id as string,
        name: d.name as string,
        amountPerMember: Number(d.amount_per_member ?? 0),
        notes: (d.notes ?? null) as string | null,
        appliedOn: d.applied_on as string,
        total: rows.reduce((a: number, r: any) => a + Number(r.amount ?? 0), 0),
        members: rows.map((r: any) => ({
          memberId: r.member_id as string,
          memberName: nameOf(r.member_id as string),
          amount: Number(r.amount ?? 0),
        })),
      };
    }),
    investments: investments.map((i: any) => ({
      id: i.id,
      name: i.name,
      category: i.category ?? null,
      initialValue: Number(i.initial_value ?? 0),
      currentValue: Number(i.current_value ?? 0),
      monthlyIncome: Number(i.monthly_income ?? 0),
    })),
    meetings: (mtRes.data ?? []).map((m: any) => ({
      id: m.id,
      title: m.title,
      agenda: m.agenda ?? null,
      location: m.location ?? null,
      scheduledAt: m.scheduled_at,
      minutes: m.minutes ?? null,
    })),
    totals: {
      members: members.length,
      savings: totalSavings - deductionsTotal,
      monthlyCollection,
      activeLoanValue,
      investmentValue: investments.reduce((a, i) => a + Number(i.current_value ?? 0), 0),
      deductionsTotal,
      pendingLoans: loans.filter((l) => ["pending", "under_review"].includes(l.status as string)).length,
    },
    monthly: monthKeys.map((m) => ({ month: m.month, amount: monthTotals.get(m.key) ?? 0 })),
    breakdown: Array.from(breakdownMap.entries()).map(([name, value]) => ({ name, value })),
  };
}
