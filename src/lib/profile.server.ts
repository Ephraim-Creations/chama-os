import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type MyProfile = {
  id: string;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  onboarded: boolean;
};

export async function readMyProfile(userId: string): Promise<MyProfile> {
  const [{ data: p }, { data: priv }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, full_name, display_name, avatar_url, onboarded_at")
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdmin.from("profile_private").select("phone").eq("id", userId).maybeSingle(),
  ]);

  return {
    id: userId,
    full_name: (p?.full_name as string | null) ?? null,
    display_name: (p?.display_name as string | null) ?? null,
    avatar_url: (p?.avatar_url as string | null) ?? null,
    phone: (priv?.phone as string | null) ?? null,
    onboarded: Boolean(p?.onboarded_at),
  };
}

export async function writeMyProfile(
  userId: string,
  input: {
    full_name: string;
    display_name: string;
    avatar_url?: string | null;
    phone?: string | null;
    markOnboarded?: boolean;
  },
) {
  const patch = {
    id: userId,
    full_name: input.full_name,
    display_name: input.display_name,
    updated_at: new Date().toISOString(),
    ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
    ...(input.markOnboarded ? { onboarded_at: new Date().toISOString() } : {}),
  };

  const { error } = await supabaseAdmin.from("profiles").upsert(patch, { onConflict: "id" });
  if (error) {
    console.error("[profile.server] save profile", error);
    throw new Error("Could not save your profile.");
  }

  if (input.phone !== undefined) {
    const { error: pErr } = await supabaseAdmin
      .from("profile_private")
      .upsert({ id: userId, phone: input.phone, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (pErr) console.error("[profile.server] save phone", pErr);
  }

  return readMyProfile(userId);
}
