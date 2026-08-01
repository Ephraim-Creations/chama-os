import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CATEGORIES = ["account", "billing", "loans", "technical", "other"] as const;

export const submitTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid().nullable().default(null),
        subject: z.string().trim().min(3).max(140),
        category: z.enum(CATEGORIES).default("other"),
        body: z.string().trim().min(10).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { createTicket } = await import("@/lib/support.server");
    return createTicket({ userId, ...data });
  });

export const listMyTicketsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { listMyTickets } = await import("@/lib/support.server");
    return listMyTickets(userId);
  });

export const listSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/admin.server");
    await assertPlatformAdmin(userId);
    const { listAllTickets } = await import("@/lib/support.server");
    return listAllTickets();
  });

export const answerSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        ticketId: z.string().uuid(),
        reply: z.string().trim().max(2000).nullable().default(null),
        status: z.enum(["open", "in_progress", "resolved"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/admin.server");
    await assertPlatformAdmin(userId);
    const { replyToTicket } = await import("@/lib/support.server");
    return replyToTicket({ adminId: userId, ...data });
  });
