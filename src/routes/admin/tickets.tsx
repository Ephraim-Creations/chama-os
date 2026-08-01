import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { listSupportTickets, answerSupportTicket } from "@/lib/support.functions";

export const Route = createFileRoute("/admin/tickets")({ component: Page });

type Ticket = Awaited<ReturnType<typeof listSupportTickets>>[number];

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

function Page() {
  const [rows, setRows] = useState<Ticket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "open">("open");

  const load = () =>
    listSupportTickets()
      .then((d) => setRows(d as Ticket[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load tickets."));

  useEffect(() => {
    void load();
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!rows)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  const openCount = rows.filter((r) => r.status !== "resolved").length;
  const list = filter === "open" ? rows.filter((r) => r.status !== "resolved") : rows;

  return (
    <div>
      <PageHeader
        title="Support tickets"
        description="Help requests submitted by members from the in-app Help center."
      />

      <div className="mb-4 flex items-center gap-2">
        {(["open", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {f} {f === "open" && openCount > 0 ? `(${openCount})` : ""}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <LifeBuoy className="mx-auto mb-3 h-6 w-6" />
          No tickets here.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((t) => (
            <TicketCard key={t.id} ticket={t} onSaved={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket, onSaved }: { ticket: Ticket; onSaved: () => void }) {
  const [reply, setReply] = useState(ticket.admin_reply ?? "");
  const [status, setStatus] = useState<"open" | "in_progress" | "resolved">(
    (ticket.status as "open" | "in_progress" | "resolved") ?? "open",
  );
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await answerSupportTicket({
        data: { ticketId: ticket.id, reply: reply.trim() || null, status },
      });
      toast.success("Reply saved and the member has been notified.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save your reply.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-foreground">{ticket.subject}</div>
          <div className="text-xs text-muted-foreground">
            {ticket.requesterName ?? "Member"}
            {ticket.chamaName ? ` · ${ticket.chamaName}` : ""} ·{" "}
            {new Date(ticket.created_at).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{ticket.category}</Badge>
          <Badge
            className={
              ticket.status === "resolved"
                ? "bg-primary/10 text-primary hover:bg-primary/10"
                : "bg-muted text-muted-foreground hover:bg-muted"
            }
          >
            {STATUS_LABEL[ticket.status] ?? ticket.status}
          </Badge>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{ticket.body}</p>

      <div className="mt-4 space-y-3">
        <Textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply the member will see in their Help center…"
          className="min-h-[90px] rounded-xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-10 w-44 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={save} disabled={busy} className="h-10 rounded-xl font-semibold">
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save &amp; notify
          </Button>
        </div>
      </div>
    </div>
  );
}
