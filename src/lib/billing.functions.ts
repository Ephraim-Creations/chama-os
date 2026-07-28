import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getChamaSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ chamaId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { loadChamaSubscription } = await import("@/lib/billing.server");
    return loadChamaSubscription(data.chamaId, context.userId);
  });
