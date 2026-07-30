import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  source: string;
  subscribed: boolean;
  created_at: string;
};

export async function saveContactMessage(input: {
  name: string;
  email: string;
  mobile: string | null;
  subject: string;
  message: string;
}) {
  const { error } = await supabaseAdmin.from("contact_messages").insert({
    ...input,
    email: input.email.toLowerCase(),
  });
  if (error) {
    console.error("[marketing] save contact message", error);
    throw new Error("Could not send your message. Please try again.");
  }
  return { ok: true as const };
}

export async function saveSubscriber(email: string, source: string) {
  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .upsert(
      { email: email.toLowerCase(), source, subscribed: true },
      { onConflict: "email" },
    );
  if (error) {
    console.error("[marketing] subscribe", error);
    throw new Error("Could not add you to the list. Please try again.");
  }
  return { ok: true as const };
}

export async function loadContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) {
    console.error("[marketing] load messages", error);
    throw new Error("Could not load messages.");
  }
  return (data ?? []) as ContactMessage[];
}

export async function markContactMessage(id: string, isRead: boolean) {
  const { error } = await supabaseAdmin
    .from("contact_messages")
    .update({ is_read: isRead })
    .eq("id", id);
  if (error) {
    console.error("[marketing] mark message", error);
    throw new Error("Could not update the message.");
  }
  return { ok: true as const };
}

export async function loadSubscribers(): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    console.error("[marketing] load subscribers", error);
    throw new Error("Could not load subscribers.");
  }
  return (data ?? []) as NewsletterSubscriber[];
}

export async function setSubscriberState(id: string, subscribed: boolean) {
  const { error } = await supabaseAdmin
    .from("newsletter_subscribers")
    .update({ subscribed })
    .eq("id", id);
  if (error) {
    console.error("[marketing] set subscriber", error);
    throw new Error("Could not update the subscriber.");
  }
  return { ok: true as const };
}
