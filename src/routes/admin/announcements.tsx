import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { listAdminChamas, sendPlatformAnnouncement } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/announcements")({ component: Page });

type Chama = Awaited<ReturnType<typeof listAdminChamas>>[number];

function Page() {
  const [chamas, setChamas] = useState<Chama[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [chamaId, setChamaId] = useState<string>("all");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void listAdminChamas()
      .then((d) => setChamas(d as Chama[]))
      .catch(() => undefined);
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await sendPlatformAnnouncement({
        data: { title: title.trim(), body: body.trim(), chamaId: chamaId === "all" ? null : chamaId },
      });
      toast.success(res.sent ? `Sent to ${res.sent} ${res.sent === 1 ? "person" : "people"}.` : "No recipients found.");
      setTitle("");
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Announcements"
        description="Send a notification to everyone on Chama-OS, or to one group only."
      />

      <form onSubmit={send} className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <select
            id="audience"
            value={chamaId}
            onChange={(e) => setChamaId(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="all">Everyone on the platform</option>
            {chamas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.members} members)
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Scheduled maintenance on Sunday"
            className="h-11 rounded-xl"
            required
            minLength={3}
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tell members what is happening and what they should do."
            rows={5}
            className="rounded-xl"
            required
            minLength={3}
            maxLength={1000}
          />
        </div>

        <Button type="submit" disabled={sending} className="h-11 rounded-xl font-semibold">
          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send announcement
        </Button>
      </form>

      <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
        <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
        Announcements appear in each member's notifications page inside the app.
      </p>
    </div>
  );
}
