import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getChamaSnapshot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ chamaId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { buildSnapshot } = await import("@/lib/chama-data.server");
    return buildSnapshot(data.chamaId, userId);
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, kind, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("[chama-data.functions] notifications", error);
      return [];
    }
    return data ?? [];
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context as any;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    if (error) console.error("[chama-data.functions] markNotificationsRead", error);
    return { ok: true };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context as any;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("read_at", null);
    if (error) console.error("[chama-data.functions] markNotificationRead", error);
    return { ok: true };
  });
