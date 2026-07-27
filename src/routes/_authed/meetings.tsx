import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { CalendarDays, Plus, MapPin, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useSnapshot } from "@/hooks/use-snapshot";
import { useChama } from "@/context/chama-context";
import { usePermissions } from "@/hooks/use-permissions";
import { scheduleMeeting } from "@/lib/records.functions";

export const Route = createFileRoute("/_authed/meetings")({ component: MeetingsPage });

function MeetingsPage() {
  const { active } = useChama();
  const { can } = usePermissions();
  const { snapshot, loading, refresh } = useSnapshot();
  const meetings = snapshot?.meetings ?? [];

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Meetings"
        description="Schedule sittings, share the agenda and keep minutes in one place."
        actions={
          can("meetings.manage") && active ? (
            <MeetingDialog chamaId={active.id} onDone={refresh} />
          ) : null
        }
      />

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState
            icon={CalendarDays}
            title="No meetings scheduled"
            description="Schedule your first sitting so members can plan ahead."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {meetings.map((m) => {
            const when = new Date(m.scheduledAt);
            const upcoming = when.getTime() >= Date.now();
            return (
              <article key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-foreground">{m.title}</h3>
                    <div className="mt-1 text-sm text-muted-foreground">{when.toLocaleString()}</div>
                  </div>
                  <Badge
                    className={
                      upcoming
                        ? "bg-primary/10 text-primary hover:bg-primary/10"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    }
                  >
                    {upcoming ? "Upcoming" : "Past"}
                  </Badge>
                </div>
                {m.location && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {m.location}
                  </div>
                )}
                {m.agenda && <p className="mt-3 text-sm text-foreground">{m.agenda}</p>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MeetingDialog({ chamaId, onDone }: { chamaId: string; onDone: () => void }) {
  const save = useServerFn(scheduleMeeting);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [agenda, setAgenda] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (title.trim().length < 2 || !when) {
      toast.error("Add a title and a date");
      return;
    }
    setBusy(true);
    try {
      await save({
        data: { chamaId, title: title.trim(), scheduledAt: when, location: location || null, agenda: agenda || null },
      });
      toast.success("Meeting scheduled");
      setOpen(false);
      setTitle("");
      setWhen("");
      setLocation("");
      setAgenda("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not schedule");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Schedule meeting
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule a meeting</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input className="h-11 rounded-xl" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date & time</Label>
            <Input type="datetime-local" className="h-11 rounded-xl" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input className="h-11 rounded-xl" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Agenda</Label>
            <Textarea className="min-h-[90px] rounded-xl" value={agenda} onChange={(e) => setAgenda(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
