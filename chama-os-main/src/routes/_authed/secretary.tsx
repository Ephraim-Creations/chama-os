import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ClipboardList, Users, Bell } from "lucide-react";

export const Route = createFileRoute("/_authed/secretary")({ component: Page });

function Page() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Secretary desk" description="Meetings, minutes, attendance and announcements." />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActionTile icon={CalendarDays} title="Schedule meeting" to="/meetings" tone="primary" />
        <ActionTile icon={ClipboardList} title="Record minutes" to="/meetings" tone="info" />
        <ActionTile icon={Users} title="Track attendance" to="/meetings" tone="navy" />
        <ActionTile icon={Bell} title="Send announcement" to="/feed" tone="warning" />
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-foreground">Next meeting</div>
            <div className="text-sm text-muted-foreground">Monthly members meeting · 28 May 2026 · 7:00 PM</div>
          </div>
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Upcoming</Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="h-10 rounded-xl">Open agenda</Button>
          <Button variant="outline" className="h-10 rounded-xl">Send reminder</Button>
        </div>
      </div>
    </div>
  );
}

function ActionTile({ icon: Icon, title, to, tone }: { icon: any; title: string; to: string; tone: "primary" | "info" | "navy" | "warning" }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    navy: "bg-navy/10 text-navy",
    warning: "bg-warning/15 text-warning",
  };
  return (
    <Link to={to} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${map[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className="mt-3 font-semibold text-foreground group-hover:text-primary">{title}</div>
    </Link>
  );
}
