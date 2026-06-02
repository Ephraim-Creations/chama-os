import { createFileRoute } from "@tanstack/react-router";
import { Plus, CalendarDays, MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { meetings } from "@/lib/mock-data";

export const Route = createFileRoute("/_authed/meetings")({
  component: MeetingsPage,
});

function MeetingsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Meetings"
        description="Schedule meetings, capture attendance, and keep agendas in one place."
        actions={<Button className="h-11 rounded-xl font-semibold"><Plus className="mr-2 h-4 w-4" />Schedule meeting</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {meetings.map((m) => (
          <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge className={m.status === "Upcoming"
                  ? "bg-primary/10 text-primary hover:bg-primary/10"
                  : "bg-muted text-muted-foreground hover:bg-muted"}>
                  {m.status}
                </Badge>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.agenda}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {new Date(m.date).toLocaleString("en", { month: "short" })}
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {new Date(m.date).getDate()}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-foreground sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{m.date} · {m.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{m.location}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{m.status === "Upcoming" ? "Attendance not yet taken" : `${m.attendees} attended`}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl">View agenda</Button>
              {m.status === "Upcoming"
                ? <Button className="flex-1 rounded-xl">Send reminder</Button>
                : <Button variant="secondary" className="flex-1 rounded-xl">Minutes</Button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
