import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Sprout, Plus, ChevronRight, Users, Loader2, MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { acceptAllMyInvites } from "@/lib/invites.functions";


export const Route = createFileRoute("/app")({
  component: AppGateway,
  head: () => ({ meta: [{ title: "Select your chama — Chama-OS" }] }),
});

const roleLabels: Record<string, string> = {
  chairperson: "Chairperson", treasurer: "Treasurer", secretary: "Secretary", member: "Member",
};

function AppGateway() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { chamas, loading, setActiveId, refresh } = useChama();
  const acceptInvites = useServerFn(acceptAllMyInvites);
  const [accepting, setAccepting] = useState(true);
  

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/login" });
  }, [user, authLoading, navigate]);

  // On entry, accept any pending invites for this email then refresh memberships.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await acceptInvites({});
        if (cancelled) return;
        if (res.accepted > 0) await refresh();
      } catch {
        // non-fatal
      } finally {
        if (!cancelled) setAccepting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, acceptInvites, refresh]);

  if (loading || authLoading || accepting) {
    return (
      <Shell>
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Shell>
    );
  }

  if (chamas.length === 0) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Plus className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">You're not in a chama yet</h1>
          <p className="mt-2 text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>. Start a new chama
            and become its Chairperson, or wait for an invite from an existing chama.
          </p>
        </div>
        <div className="mt-8 grid gap-4">
          <ActionCard
            to="/app/create"
            icon={Plus}
            title="Create a chama"
            body="You become the Chairperson and can invite members and assign their roles by email."
            cta="Create chama"
          />
          <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left text-sm text-muted-foreground">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <MailQuestion className="h-4 w-4" /> Expecting an invite?
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Make sure you signed in with the same email your chairperson invited.</li>
              <li>Contact your chairperson and ask them to invite this email.</li>
            </ul>
          </div>
        </div>
      </Shell>
    );
  }


  return (
    <Shell>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Select your chama</h1>
        <p className="mt-2 text-muted-foreground">You belong to {chamas.length} chama{chamas.length === 1 ? "" : "s"}.</p>
      </div>

      <div className="mt-8 space-y-3">
        {chamas.map((c) => (
          <button
            key={c.id}
            onClick={() => { setActiveId(c.id); navigate({ to: "/dashboard" }); }}
            className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary hover:shadow-md"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-base font-semibold text-foreground">{c.name}</div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{roleLabels[c.role]}</Badge>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {c.type.replace(/_/g, " ")} {c.location ? `· ${c.location}` : ""}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-8">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link to="/app/create"><Plus className="mr-2 h-4 w-4" /> Create another chama</Link>
        </Button>
      </div>

    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-2 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="font-bold tracking-tight text-sm sm:text-base truncate">Chama-OS</div>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-16">{children}</main>
    </div>
  );
}

function ActionCard({
  to, icon: Icon, title, body, cta,
}: { to: string; icon: React.ComponentType<{ className?: string }>; title: string; body: string; cta: string }) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-md"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="mt-4 text-lg font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
        {cta} <ChevronRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
