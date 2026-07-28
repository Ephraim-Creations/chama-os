import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, HandCoins, CalendarDays, Megaphone, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { listMyNotifications } from "@/lib/chama-data.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/notifications")({
  component: NotificationsPage,
});

type Note = {
  id: string; title: string; body: string | null; kind: string;
  read_at: string | null; created_at: string;
};

const iconFor = (t: string) =>
  t === "loan" ? HandCoins : t === "meeting" ? CalendarDays : t === "announce" ? Megaphone : Bell;
const toneFor = (t: string) =>
  t === "loan" ? "bg-warning/15 text-warning"
    : t === "meeting" ? "bg-info/10 text-info"
    : t === "announce" ? "bg-navy/10 text-navy"
    : "bg-primary/10 text-primary";

function NotificationsPage() {
  const load = useServerFn(listMyNotifications);
  const markRead = useServerFn(markNotificationsRead);
  const [items, setItems] = useState<Note[] | null>(null);

  useEffect(() => {
    void load()
      .then(async (rows) => {
        setItems(rows as Note[]);
        if ((rows as Note[]).some((r) => !r.read_at)) {
          await markRead({ data: undefined }).catch(() => undefined);
        }
        window.dispatchEvent(new Event("notifications-updated"));
      })
      .catch(() => setItems([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Notifications" description="Reminders and updates from your chama." />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {items === null ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Reminders about contributions, loans and meetings will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = iconFor(n.kind);
              return (
                <li key={n.id} className={cn("flex gap-4 p-5", !n.read_at && "bg-primary/5")}>
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", toneFor(n.kind))}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{n.title}</div>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
