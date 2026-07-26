import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailQuestion, LogOut, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { getAccessStatus } from "@/lib/access.functions";

export const Route = createFileRoute("/no-access")({
  component: NoAccessPage,
  head: () => ({
    meta: [
      { title: "No chama found for your email — Chama-OS" },
      {
        name: "description",
        content: "Your email isn't on any chama's member list yet. Ask your chairperson to add it.",
      },
      { property: "og:title", content: "No chama found for your email — Chama-OS" },
      {
        property: "og:description",
        content: "Ask your chama chairperson to add this exact email, or apply to open your own chama.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function NoAccessPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [checking, setChecking] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    void getAccessStatus()
      .then((s) => {
        setPendingApplication(s.application?.status === "pending");
        if (s.memberships > 0 || s.canCreateChama) navigate({ to: "/dashboard" });
      })
      .catch(() => undefined);
  }, [user, navigate]);

  async function recheck() {
    setChecking(true);
    try {
      const s = await getAccessStatus();
      if (s.memberships > 0 || s.canCreateChama) navigate({ to: "/dashboard" });
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <MailQuestion className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-foreground">
          We couldn't find your chama
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground">
          You're signed in as{" "}
          <span className="font-semibold text-foreground">{user?.email ?? "this account"}</span>, but this
          email isn't on any chama's member list yet.
        </p>

        {pendingApplication && (
          <div className="mt-5 rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-foreground">
            Your chairperson application is <span className="font-semibold">under review</span>. We'll be in
            touch shortly — once it's approved you can set up your chama here.
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
          <div className="text-sm font-semibold text-foreground">What to do next</div>
          <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">1.</span>
              <span>
                Message your chama chairperson and ask them to add{" "}
                <span className="font-medium text-foreground">{user?.email}</span> to the group's members
                list. It must be this exact email.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">2.</span>
              <span>
                They do it from their dashboard: <span className="font-medium text-foreground">Members → Invite member</span>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-foreground">3.</span>
              <span>Come back here and press "Check again" — you'll go straight to your dashboard.</span>
            </li>
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={recheck} disabled={checking} className="h-11 flex-1 rounded-xl font-semibold">
            {checking ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Check again
          </Button>
          <Button onClick={handleSignOut} variant="outline" className="h-11 rounded-xl font-semibold">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        {!pendingApplication && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Leading your own group?{" "}
            <Link to="/join/apply" className="font-medium text-primary hover:underline">
              Apply to open a chama
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
