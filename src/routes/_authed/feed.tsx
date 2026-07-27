import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Megaphone, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { usePermissions } from "@/hooks/use-permissions";
import { initialsOf } from "@/lib/mock-data";

export const Route = createFileRoute("/_authed/feed")({ component: Page });

type Post = {
  id: string;
  body: string;
  is_announcement: boolean;
  created_at: string;
  author_id: string;
  authorName: string;
};

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Page() {
  const { user } = useAuth();
  const { active } = useChama();
  const { isChair } = usePermissions();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [announce, setAnnounce] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!active) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("feed_posts")
      .select("id, body, is_announcement, created_at, author_id")
      .eq("chama_id", active.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = data ?? [];
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    const names = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", ids);
      (profs ?? []).forEach((p: any) =>
        names.set(p.id, p.display_name || p.full_name || "Member"),
      );
    }
    setPosts(rows.map((r) => ({ ...r, authorName: names.get(r.author_id) ?? "Member" })));
    setLoading(false);
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  const post = async () => {
    if (!active || !user) return;
    if (body.trim().length < 2) {
      toast.error("Write something first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("feed_posts").insert({
      chama_id: active.id,
      author_id: user.id,
      body: body.trim(),
      is_announcement: isChair ? announce : false,
    });
    setBusy(false);
    if (error) {
      toast.error("Could not post right now");
      return;
    }
    setBody("");
    setAnnounce(false);
    void load();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Community feed" description="Announcements and group discussions." />

      {active && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share an update with the chama…"
            className="min-h-[88px] resize-none rounded-xl border-border bg-muted/30 text-[15px]"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            {isChair ? (
              <Button
                variant={announce ? "default" : "outline"}
                className="h-10 rounded-xl"
                onClick={() => setAnnounce((a) => !a)}
              >
                <Megaphone className="mr-2 h-4 w-4" /> {announce ? "Announcement on" : "Mark as announcement"}
              </Button>
            ) : (
              <span />
            )}
            <Button className="h-10 rounded-xl font-semibold" disabled={busy} onClick={post}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Post
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <EmptyState icon={Megaphone} title="Nothing posted yet" description="Be the first to share an update with your group." />
          </div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initialsOf(p.authorName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-foreground">{p.authorName}</div>
                    {p.is_announcement && (
                      <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Announcement</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{timeAgo(p.created_at)}</div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">{p.body}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
