import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell, HandCoins, CalendarDays, Megaphone, Loader2, CheckCheck, Coins } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  listMyNotifications,
  markNotificationRead,
  markNotificationsRead,
} from "@/lib/chama-data.functions";
import { NOTIFICATION_FILTERS, matchesFilter, routeForKind } from "@/lib/notification-routes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/notifications")({
  component: NotificationsPage,
});

type Note = {
  id: string; title: string; body: string | null; kind: string;
  read_at: string | null; created_at: string;
};

const iconFor = (t: string) => {
  const k = (t || "").toLowerCase();
  if (k.startsWith("loan")) return HandCoins;
  if (k.startsWith("meeting")) return CalendarDays;
  if (k.startsWith("announce") || k === "feed") return Megaphone;
  if (k.startsWith("contribution") || k.startsWith("deduction") || k.startsWith("report") || k === "finance")
    return Coins;
  return Bell;
};

const toneFor = (t: string) => {
  const k = (t || "").toLowerCase();
  if (k.startsWith("loan")) return "bg-warning/15 text-warning";
  if (k.startsWith("meeting")) return "bg-info/10 text-info";
  if (k.startsWith("announce") || k === "feed") return "bg-navy/10 text-navy";
  return "bg-primary/10 text-primary";
};

function NotificationsPage() {
  const navigate = useNavigate();
  const load = useServerFn(listMyNotifications);
  const markOne = useServerFn(markNotificationRead);
  const markAll = useServerFn(markNotificationsRead);

  const [items, setItems] = useState<Note[] | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    void load()
      .then((rows) => setItems(rows as Note[]))
      .catch(() => setItems([]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = useMemo(
    () => (items ?? []).filter((n) => matchesFilter(n.kind, filter)),
    [items, filter],
  );
  const unread = (items ?? []).filter((n) => !n.read_at).length;

  const readAll = async () => {
    await markAll({ data: undefined }).catch(() => undefined);
    setItems((prev) => prev?.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })) ?? prev);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  const openNote = async (n: Note) => {
    if (!n.read_at) {
      await markOne({ data: { id: n.id } }).catch(() => undefined);
      setItems((prev) =>
        prev?.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)) ?? prev,
      );
      window.dispatchEvent(new Event("notifications-updated"));
    }
    navigate({ to: routeForKind(n.kind) });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Reminders and updates from your chama."
        action={
          <Button variant="outline" className="gap-2" onClick={readAll} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {NOTIFICATION_FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {items === null ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="Reminders about contributions, loans and meetings will appear here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((n) => {
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 self-center"
                    onClick={() => void openNote(n)}
                  >
                    Read
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
