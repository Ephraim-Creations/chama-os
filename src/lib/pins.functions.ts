import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Your PIN must be 4 digits");

export const getPinStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { hasPin } = await import("@/lib/pins.server");
    return { hasPin: await hasPin(userId) };
  });

export const setMyPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ pin: pinSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { userId } = context as { userId: string };
    const { savePin } = await import("@/lib/pins.server");
    return savePin(userId, data.pin);
  });

export const removeMyPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context as { userId: string };
    const { clearPin } = await import("@/lib/pins.server");
    return clearPin(userId);
  });

/** Public: email + PIN sign-in. Returns a one-time token, never a password. */
export const pinSignIn = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ email: z.string().trim().email().max(255), pin: pinSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { signInWithPin } = await import("@/lib/pins.server");
    return signInWithPin(data.email, data.pin);
  });

/**
 * PINs are self-service only: a member sets or replaces their own PIN via
 * setMyPin. No official can reset another person's PIN.
 */
