import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPlatformAdmin } from "@/lib/access.server";
import { loadAnalytics, type AnalyticsRange, type AnalyticsSummary } from "@/lib/analytics.server";

export type { AnalyticsSummary, AnalyticsRange };

export const getWebsiteAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ rangeDays: z.union([z.literal(7), z.literal(30), z.literal(90)]).default(30) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    return loadAnalytics(data.rangeDays as AnalyticsRange);
  });
