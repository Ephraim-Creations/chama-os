import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const recordContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        memberId: z.string().uuid(),
        type: z.enum(["savings", "welfare", "project", "penalty", "withdrawal", "investment"]),
        amount: z.number().positive().max(100_000_000),
        notes: z.string().trim().max(300).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { insertContribution } = await import("@/lib/records.server");
    return insertContribution(data.chamaId, userId, data);
  });

export const recordLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        borrowerId: z.string().uuid(),
        amount: z.number().positive().max(100_000_000),
        purpose: z.string().trim().min(3).max(300),
        months: z.number().int().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { insertLoan } = await import("@/lib/records.server");
    return insertLoan(data.chamaId, userId, data);
  });

export const scheduleMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        title: z.string().trim().min(2).max(140),
        agenda: z.string().trim().max(1000).optional().nullable(),
        location: z.string().trim().max(200).optional().nullable(),
        scheduledAt: z.string().min(4),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { insertMeeting } = await import("@/lib/records.server");
    return insertMeeting(data.chamaId, userId, {
      ...data,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
    });
  });

export const addInvestment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        name: z.string().trim().min(2).max(140),
        category: z.string().trim().max(60).optional().nullable(),
        initialValue: z.number().min(0).max(1_000_000_000),
        currentValue: z.number().min(0).max(1_000_000_000),
        monthlyIncome: z.number().min(0).max(100_000_000),
        notes: z.string().trim().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { insertInvestment } = await import("@/lib/records.server");
    return insertInvestment(data.chamaId, userId, data);
  });

export const decideLoanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        loanId: z.string().uuid(),
        decision: z.enum(["approved", "rejected", "under_review"]),
        note: z.string().trim().max(300).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { decideLoan } = await import("@/lib/records.server");
    return decideLoan(data.chamaId, userId, data);
  });
