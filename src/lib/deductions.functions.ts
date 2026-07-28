import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createDeductionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        name: z.string().trim().min(2).max(140),
        amountPerMember: z.number().positive().max(100_000_000),
        notes: z.string().trim().max(300).optional().nullable(),
        appliedOn: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable(),
        memberIds: z.array(z.string().uuid()).min(1).max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { createDeduction } = await import("@/lib/deductions.server");
    return createDeduction(data.chamaId, userId, data);
  });

export const removeDeductionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ chamaId: z.string().uuid(), deductionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { removeDeduction } = await import("@/lib/deductions.server");
    return removeDeduction(data.chamaId, userId, data.deductionId);
  });
