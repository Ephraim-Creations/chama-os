import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertPlatformAdmin, computeAccess } from "@/lib/access.server";

export const getAccessStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, claims } = context as { userId: string; claims: { email?: string } };
    return computeAccess(userId, claims?.email ?? "");
  });

export const submitChairApplication = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        full_name: z.string().trim().min(2).max(120),
        phone: z.string().trim().min(7).max(30),
        email: z.string().trim().email().max(255),
        chama_name: z.string().trim().min(2).max(120),
        location: z.string().trim().max(200).optional().default(""),
        note: z.string().trim().max(600).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from("chair_applications")
      .select("id, status")
      .ilike("email", email)
      .in("status", ["pending", "approved"])
      .maybeSingle();
    if (existing) {
      return { ok: true, duplicate: true, status: existing.status as string };
    }

    const { error } = await supabaseAdmin.from("chair_applications").insert({
      full_name: data.full_name,
      phone: data.phone,
      email,
      chama_name: data.chama_name,
      location: data.location || null,
      note: data.note || null,
    });
    if (error) {
      console.error("[access.functions] submit application", error);
      throw new Error("Could not send your application. Please try again.");
    }
    return { ok: true, duplicate: false, status: "pending" };
  });

export const listChairApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("chair_applications")
      .select("id, full_name, phone, email, chama_name, location, note, status, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[access.functions] list applications", error);
      throw new Error("Could not load applications.");
    }
    return data ?? [];
  });

export const decideChairApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        decision: z.enum(["approved", "rejected"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    await assertPlatformAdmin(userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("chair_applications")
      .update({
        status: data.decision,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .select("email")
      .maybeSingle();
    if (error) {
      console.error("[access.functions] decide application", error);
      throw new Error("Could not update the application.");
    }

    let emailed = false;
    if (data.decision === "approved" && row?.email) {
      const { sendSetupInvite } = await import("@/lib/onboarding.server");
      const result = await sendSetupInvite(row.email);
      emailed = result.sent;
    }
    return { ok: true, emailed };
  });
