import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assertPlatformAdmin,
  broadcast,
  loadChamas,
  loadOverview,
  setChamaPlan as applyPlan,
  setChamaStatus as applyStatus,
} from "@/lib/admin.server";

export const setChamaPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        chamaId: z.string().uuid(),
        plan: z.string().trim().min(2).max(40),
        status: z.enum(["active", "trialing", "past_due", "cancelled"]).default("active"),
        renewsAt: z.string().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    return applyPlan(data);
  });

export const setChamaStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ chamaId: z.string().uuid(), status: z.enum(["active", "suspended"]) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    return applyStatus(data.chamaId, data.status);
  });

export const getPlatformOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    return loadOverview();
  });

export const listAdminChamas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    return loadChamas();
  });

export const sendPlatformAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().trim().min(3).max(120),
        body: z.string().trim().min(3).max(1000),
        chamaId: z.string().uuid().nullable().default(null),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    const sent = await broadcast(data);
    return { sent };
  });

export const listPricingPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("pricing_plans")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("[admin.functions] list plans", error);
    throw new Error("Could not load pricing plans.");
  }
  return data ?? [];
});

export const savePricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z
          .string()
          .trim()
          .min(2)
          .max(40)
          .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes"),
        name: z.string().trim().min(2).max(60),
        price_label: z.string().trim().min(1).max(40),
        amount_kes: z.number().int().min(0).max(10_000_000),
        period: z.string().trim().min(1).max(20),
        description: z.string().trim().max(300).optional().default(""),
        features: z.array(z.string().trim().min(1).max(120)).max(20),
        highlight: z.boolean(),
        sort_order: z.number().int().min(0).max(999),
        published: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data, description: data.description || null };
    const { error } = data.id
      ? await supabaseAdmin.from("pricing_plans").update(row).eq("id", data.id)
      : await supabaseAdmin.from("pricing_plans").insert(row);
    if (error) {
      console.error("[admin.functions] save plan", error);
      throw new Error("Could not save the plan.");
    }
    return { ok: true };
  });

export const deletePricingPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("pricing_plans").delete().eq("id", data.id);
    if (error) {
      console.error("[admin.functions] delete plan", error);
      throw new Error("Could not delete the plan.");
    }
    return { ok: true };
  });
