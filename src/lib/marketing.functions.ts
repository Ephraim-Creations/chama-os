import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(255),
        mobile: z.string().trim().max(40).optional().default(""),
        subject: z.string().trim().min(1).max(200),
        message: z.string().trim().min(1).max(5000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { saveContactMessage } = await import("@/lib/marketing.server");
    return saveContactMessage({ ...data, mobile: data.mobile || null });
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        source: z.string().trim().max(40).optional().default("footer"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { saveSubscriber } = await import("@/lib/marketing.server");
    return saveSubscriber(data.email, data.source || "footer");
  });

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/access.server");
    await assertPlatformAdmin(userId);
    const { loadContactMessages } = await import("@/lib/marketing.server");
    return loadContactMessages();
  });

export const setContactMessageRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), isRead: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/access.server");
    await assertPlatformAdmin(userId);
    const { markContactMessage } = await import("@/lib/marketing.server");
    return markContactMessage(data.id, data.isRead);
  });

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/access.server");
    await assertPlatformAdmin(userId);
    const { loadSubscribers } = await import("@/lib/marketing.server");
    return loadSubscribers();
  });

export const setNewsletterSubscriberState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), subscribed: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { assertPlatformAdmin } = await import("@/lib/access.server");
    await assertPlatformAdmin(userId);
    const { setSubscriberState } = await import("@/lib/marketing.server");
    return setSubscriberState(data.id, data.subscribed);
  });
