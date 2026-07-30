import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Mail, MailOpen, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listContactMessages, setContactMessageRead } from "@/lib/marketing.functions";

export const Route = createFileRoute("/admin/messages")({ component: Page });

type Message = Awaited<ReturnType<typeof listContactMessages>>[number];

function Page() {
  const [rows, setRows] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = () =>
    listContactMessages()
      .then((d) => setRows(d as Message[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load messages."));

  useEffect(() => {
    void load();
  }, []);

  const toggle = async (m: Message) => {
    await setContactMessageRead({ data: { id: m.id, isRead: !m.is_read } });
    void load();
  };

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!rows)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  const list = filter === "unread" ? rows.filter((r) => !r.is_read) : rows;
  const unread = rows.filter((r) => !r.is_read).length;

  return (
    <div>
      <PageHeader
        title="Contact messages"
        description="Enquiries submitted from the website contact form, including custom Federation plan requests."
      />

      <div className="mb-4 flex items-center gap-2">
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {f} {f === "unread" && unread > 0 ? `(${unread})` : ""}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border bg-card p-5 shadow-sm ${
                m.is_read ? "border-border" : "border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{m.name}</span>
                    {!m.is_read && <Badge className="bg-primary text-primary-foreground">New</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-primary">
                      <Mail className="h-3.5 w-3.5" /> {m.email}
                    </a>
                    {m.mobile && (
                      <a href={`tel:${m.mobile}`} className="inline-flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" /> {m.mobile}
                      </a>
                    )}
                    <span>{new Date(m.created_at).toLocaleString("en-KE")}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => void toggle(m)}>
                  <MailOpen className="mr-1.5 h-4 w-4" />
                  {m.is_read ? "Mark unread" : "Mark read"}
                </Button>
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">{m.subject}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
