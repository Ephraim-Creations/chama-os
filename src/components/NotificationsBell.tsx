import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  listMyNotifications, markNotificationRead, markNotificationsRead,
} from "@/lib/chama-data.functions";
import { routeForKind } from "@/lib/notification-routes";
import { cn } from "@/lib/utils";

type Note = {
  id: string; title: string; body: string | null; kind: string;
  read_at: string | null; created_at: string;
};

export function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const load = useServerFn(listMyNotifications);
  const markOne = useServerFn(markNotificationRead);
  const markAll = useServerFn(markNotificationsRead);

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Note[] | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setUnread(0);
      return;
    }
    let cancelled = false;
    const loadUnread = () => {
      void supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null)
        .then(({ count }) => {
          if (!cancelled) setUnread(count ?? 0);
        });
    };
    loadUnread();
    window.addEventListener("notifications-updated", loadUnread);
    return () => {
      cancelled = true;
      window.removeEventListener("notifications-updated", loadUnread);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!open) return;
    setItems(null);
    void load()
      .then((rows) => setItems(rows as Note[]))
      .catch(() => setItems([]));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const openNote = async (n: Note) => {
    setOpen(false);
    if (!n.read_at) {
      await markOne({ data: { id: n.id } }).catch(() => undefined);
      window.dispatchEvent(new Event("notifications-updated"));
    }
    navigate({ to: routeForKind(n.kind) });
  };

  const readAll = async () => {
    await markAll({ data: undefined }).catch(() => undefined);
    setItems((prev) => prev?.map((n) => ({ ...n, read_at: new Date().toISOString() })) ?? prev);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-11 w-11" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge className="absolute -right-0.5 -top-0.5 h-5 min-w-5 rounded-full bg-destructive p-0 px-1 text-[10px] text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold text-foreground">Notifications</div>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={readAll}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          {items === null ? (
            <div className="grid place-items-center py-10">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              You&apos;re all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.slice(0, 8).map((n) => (
                <li key={n.id} className={cn("px-4 py-3", !n.read_at && "bg-primary/5")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">{n.title}</div>
                      {n.body && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      )}
                      <div className="mt-1 text-[11px] text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 shrink-0 text-xs" onClick={() => void openNote(n)}>
                      Open
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-2">
          <Button asChild variant="ghost" size="sm" className="w-full text-xs" onClick={() => setOpen(false)}>
            <Link to="/notifications">See all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
