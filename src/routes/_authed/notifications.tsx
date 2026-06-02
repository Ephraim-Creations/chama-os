import { createFileRoute } from "@tanstack/react-router";
import { Bell, HandCoins, CalendarDays, Megaphone, CheckCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/notifications")({
  component: NotificationsPage,
});

const iconFor = (t: string) =>
  t === "loan" ? HandCoins : t === "meeting" ? CalendarDays : t === "announce" ? Megaphone : Bell;
const toneFor = (t: string) =>
  t === "loan" ? "bg-warning/15 text-warning"
    : t === "meeting" ? "bg-info/10 text-info"
    : t === "announce" ? "bg-navy/10 text-navy"
    : "bg-primary/10 text-primary";

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Reminders, alerts and announcements from your chama."
        actions={<Button variant="outline" className="h-11 rounded-xl"><CheckCheck className="mr-2 h-4 w-4" />Mark all read</Button>}
      />

      <div className="rounded-2xl border border-border bg-card shadow-sm">
        {notifications.map((n, i) => {
          const Icon = iconFor(n.type);
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-4 p-5 transition hover:bg-muted/40",
                i !== notifications.length - 1 && "border-b border-border",
                n.unread && "bg-primary/[0.03]",
              )}
            >
              <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", toneFor(n.type))}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-foreground">{n.title}</h3>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                <div className="mt-2 text-xs text-muted-foreground">{n.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
