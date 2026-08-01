import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type SupportTicket = {
  id: string;
  user_id: string;
  chama_id: string | null;
  subject: string;
  category: string;
  body: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  requesterName?: string;
  chamaName?: string | null;
};

export async function createTicket(input: {
  userId: string;
  chamaId: string | null;
  subject: string;
  category: string;
  body: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .insert({
      user_id: input.userId,
      chama_id: input.chamaId,
      subject: input.subject,
      category: input.category,
      body: input.body,
    } as never)
    .select("id")
    .single();
  if (error) {
    console.error("[support.server] createTicket", error);
    throw new Error("Could not submit your request. Please try again.");
  }
  return { id: (data as { id: string }).id };
}

export async function listMyTickets(userId: string): Promise<SupportTicket[]> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("id, user_id, chama_id, subject, category, body, status, admin_reply, replied_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[support.server] listMyTickets", error);
    throw new Error("Could not load your requests.");
  }
  return (data ?? []) as SupportTicket[];
}

export async function listAllTickets(): Promise<SupportTicket[]> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("id, user_id, chama_id, subject, category, body, status, admin_reply, replied_at, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[support.server] listAllTickets", error);
    throw new Error("Could not load tickets.");
  }
  const rows = (data ?? []) as SupportTicket[];
  if (!rows.length) return rows;

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const chamaIds = [...new Set(rows.map((r) => r.chama_id).filter(Boolean))] as string[];

  const [{ data: profiles }, { data: chamas }] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name, display_name").in("id", userIds),
    chamaIds.length
      ? supabaseAdmin.from("chamas").select("id, name").in("id", chamaIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const nameOf = new Map(
    (profiles ?? []).map((p: any) => [p.id as string, (p.display_name || p.full_name || "Member") as string]),
  );
  const chamaOf = new Map((chamas ?? []).map((c: any) => [c.id as string, c.name as string]));

  return rows.map((r) => ({
    ...r,
    requesterName: nameOf.get(r.user_id) ?? "Member",
    chamaName: r.chama_id ? (chamaOf.get(r.chama_id) ?? null) : null,
  }));
}

export async function replyToTicket(input: {
  adminId: string;
  ticketId: string;
  reply: string | null;
  status: "open" | "in_progress" | "resolved";
}) {
  const { data: ticket } = await supabaseAdmin
    .from("support_tickets")
    .select("id, user_id, chama_id, subject")
    .eq("id", input.ticketId)
    .maybeSingle();
  if (!ticket) throw new Error("That request no longer exists.");

  const patch: Record<string, unknown> = { status: input.status };
  if (input.reply && input.reply.trim()) {
    patch['admin_reply'] = input.reply.trim();
    patch['replied_at'] = new Date().toISOString();
    patch['replied_by'] = input.adminId;
  }

  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update(patch as never)
    .eq("id", input.ticketId);
  if (error) {
    console.error("[support.server] replyToTicket", error);
    throw new Error("Could not save your reply.");
  }

  if (input.reply && input.reply.trim()) {
    const { error: nErr } = await supabaseAdmin.from("notifications").insert({
      user_id: (ticket as { user_id: string }).user_id,
      chama_id: (ticket as { chama_id: string | null }).chama_id,
      title: "Support replied to your request",
      body: input.reply.trim().slice(0, 300),
      kind: "support",
    } as never);
    if (nErr) console.error("[support.server] notify", nErr);
  }

  return { ok: true };
}
