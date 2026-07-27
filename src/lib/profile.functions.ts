import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { readMyProfile } = await import("@/lib/profile.server");
    return readMyProfile(userId);
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(120),
        display_name: z.string().trim().min(2).max(60),
        avatar_url: z.string().trim().max(500).nullable().optional(),
        phone: z.string().trim().max(30).nullable().optional(),
        markOnboarded: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { writeMyProfile } = await import("@/lib/profile.server");
    return writeMyProfile(userId, data);
  });
