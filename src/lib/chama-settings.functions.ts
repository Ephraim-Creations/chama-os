import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { saveChamaSettingsSchema } from "@/lib/chama.schemas";

export const getChamaSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ chamaId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { loadChamaSettings } = await import("@/lib/chama-settings.server");
    return loadChamaSettings(data.chamaId, context.userId);
  });

export const updateChamaSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => saveChamaSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { saveChamaSettings } = await import("@/lib/chama-settings.server");
    return saveChamaSettings(data, context.userId);
  });
