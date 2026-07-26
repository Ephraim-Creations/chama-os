import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function appOrigin() {
  try {
    const req = getRequest();
    const origin = req?.headers.get("origin");
    if (origin) return origin;
    const referer = req?.headers.get("referer");
    if (referer) return new URL(referer).origin;
  } catch {
    /* no request context */
  }
  return "https://chama-os.lovable.app";
}

/**
 * Makes sure the person has an account and emails them a link that lands on
 * /set-password. Works for both brand new people (invite) and people who
 * already have an account (recovery link).
 */
export async function sendSetupInvite(rawEmail: string): Promise<{
  sent: boolean;
  link: string | null;
  alreadyActive: boolean;
}> {
  const email = rawEmail.trim().toLowerCase();
  const redirectTo = `${appOrigin()}/set-password`;

  const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    { redirectTo },
  );

  if (!inviteErr && invited?.user) {
    return { sent: true, link: null, alreadyActive: false };
  }

  // Already registered — send a set-password (recovery) email instead.
  const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo });
  const { data: link } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });
  if (resetErr) {
    console.error("[onboarding.server] sendSetupInvite", inviteErr, resetErr);
  }
  return {
    sent: !resetErr,
    link: link?.properties?.action_link ?? null,
    alreadyActive: true,
  };
}
