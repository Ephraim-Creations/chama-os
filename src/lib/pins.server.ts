import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ITERATIONS = 120_000;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPin(pin: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: new TextEncoder().encode(salt),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256,
  );
  return toHex(bits);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function savePin(userId: string, pin: string) {
  const salt = randomSalt();
  const pin_hash = await hashPin(pin, salt);
  const { error } = await supabaseAdmin
    .from("user_pins")
    .upsert(
      { user_id: userId, pin_hash, salt, failed_attempts: 0, locked_until: null },
      { onConflict: "user_id" },
    );
  if (error) {
    console.error("[pins.server] savePin", error);
    throw new Error("Could not save your PIN.");
  }
  return { ok: true };
}

export async function clearPin(userId: string) {
  const { error } = await supabaseAdmin.from("user_pins").delete().eq("user_id", userId);
  if (error) {
    console.error("[pins.server] clearPin", error);
    throw new Error("Could not reset the PIN.");
  }
  return { ok: true };
}

export async function hasPin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_pins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return Boolean(data);
}

async function findUserByEmail(email: string) {
  // listUsers is paginated; the filter keeps this cheap enough for our scale.
  let page = 1;
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("[pins.server] listUsers", error);
      return null;
    }
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
    page++;
    if (page > 25) return null;
  }
}

const GENERIC = "Email or PIN is not correct.";

/**
 * Verifies email + PIN and returns a one-time token the browser exchanges for
 * a session. Never reveals whether the email exists.
 */
export async function signInWithPin(rawEmail: string, pin: string) {
  const email = rawEmail.trim().toLowerCase();
  const user = await findUserByEmail(email);
  if (!user) throw new Error(GENERIC);

  const { data: row } = await supabaseAdmin
    .from("user_pins")
    .select("pin_hash, salt, failed_attempts, locked_until")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!row) throw new Error(GENERIC);

  if (row.locked_until && new Date(row.locked_until) > new Date()) {
    throw new Error("Too many attempts. Try again in a few minutes or use your password.");
  }

  const attempt = await hashPin(pin, row.salt);
  if (!safeEqual(attempt, row.pin_hash)) {
    const failed = (row.failed_attempts ?? 0) + 1;
    await supabaseAdmin
      .from("user_pins")
      .update({
        failed_attempts: failed,
        locked_until:
          failed >= MAX_ATTEMPTS
            ? new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString()
            : null,
      })
      .eq("user_id", user.id);
    if (failed >= MAX_ATTEMPTS) {
      throw new Error("Too many attempts. Try again in 15 minutes or use your password.");
    }
    throw new Error(GENERIC);
  }

  await supabaseAdmin
    .from("user_pins")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("user_id", user.id);

  const { data: link, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkErr || !tokenHash) {
    console.error("[pins.server] generateLink", linkErr);
    throw new Error("Could not start your session. Please use your password.");
  }
  return { tokenHash, email };
}
