import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Megaphone, MessageCircle, Send } from "lucide-react";

export const Route = createFileRoute("/_authed/feed")({ component: Page });

const posts = [
  { id: 1, author: "Otieno Ochieng", initials: "OO", time: "2h ago", announcement: true, body: "Reminder: May contributions are due by 25th. Please record by Sunday so we close the month cleanly.", comments: 4 },
  { id: 2, author: "Akinyi Adhiambo", initials: "AA", time: "1d ago", announcement: false, body: "AGM minutes have been published under Reports. Have a look and raise any corrections in this thread.", comments: 2 },
  { id: 3, author: "Wanjiku Kamau", initials: "WK", time: "3d ago", announcement: false, body: "Quick update: the Kiserian plot was valued at Ksh 1.2M this quarter — full report in Investments.", comments: 7 },
];

function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Community feed" description="Announcements and group discussions." />
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <Textarea placeholder="Share an update with the chama…" className="min-h-[88px] resize-none rounded-xl border-border bg-muted/30 text-[15px]" />
        <div className="mt-3 flex items-center justify-between">
          <Button variant="outline" className="h-10 rounded-xl"><Megaphone className="mr-2 h-4 w-4" /> Mark as announcement</Button>
          <Button className="h-10 rounded-xl font-semibold"><Send className="mr-2 h-4 w-4" /> Post</Button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <article key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border"><AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{p.initials}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold text-foreground">{p.author}</div>
                  {p.announcement && <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Announcement</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">{p.time}</div>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground">{p.body}</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-foreground"><MessageCircle className="h-4 w-4" /> {p.comments} comments</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
