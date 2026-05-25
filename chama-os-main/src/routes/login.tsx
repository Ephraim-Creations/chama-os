import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sprout, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({
  intent: z.enum(["create", "join"]).optional(),
  invite: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Chama-OS" },
      { name: "description", content: "Sign in to your chama's digital record-keeping platform." },
    ],
  }),
});

function destinationFor(intent?: "create" | "join") {
  if (intent === "create") return "/app/create";
  return "/app";
}

function LoginPage() {
  const navigate = useNavigate();
  const { intent } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [setupNeeded, setSetupNeeded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destinationFor(intent) });
    }).catch(() => {
      setSetupNeeded(true);
    });
  }, [navigate, intent]);

  const signIn = async () => {
    setBusy(true);
    try {
      // Test connection first
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error && error.message.includes('fetch')) {
          throw new Error('setup');
        }
      } catch (e) {
        setSetupNeeded(true);
        toast.error("Setup needed. Please complete the setup first.");
        setBusy(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + destinationFor(intent),
        },
      });
      if (error) {
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          setSetupNeeded(true);
          toast.error("Network error. Check your internet and ensure Supabase is configured.");
        } else {
          toast.error(`Sign-in failed: ${error.message}`);
        }
        setBusy(false);
      }
    } catch (err) {
      toast.error("Sign-in failed. Please try again.");
      setBusy(false);
    }
  };

  const heading =
    intent === "create" ? "Create your chama"
    : intent === "join" ? "Join your chama"
    : "Karibu 👋 Sign in to your chama";

  const sub =
    intent === "create"
      ? "Sign in with Google to set up your chama. You'll become the Chairperson."
      : intent === "join"
      ? "Sign in with Google using the same email your chairperson invited."
      : "Sign in with the Google email your chairperson registered for you.";

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-8 sm:px-6 md:px-12 md:py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-md">
          {setupNeeded && (
            <Alert className="mb-6 border-amber-600 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                Setup is required. <Link to="/setup" className="font-semibold underline">Complete setup steps →</Link>
              </AlertDescription>
            </Alert>
          )}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold text-foreground truncate">Chama-OS</div>
              <div className="text-xs text-muted-foreground line-clamp-1">Transparent records</div>
            </div>
          </div>

          <h1 className="mt-8 sm:mt-10 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{heading}</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">{sub}</p>

          {!intent && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <div className="font-semibold text-foreground">Before you tap the button:</div>
              <ol className="mt-2 space-y-1.5 text-muted-foreground">
                <li>1. Use the <span className="font-medium text-foreground">same email</span> your chairperson added you with.</li>
                <li>2. Tap <span className="font-medium text-foreground">Continue with Google</span> below.</li>
                <li>3. Pick that email on the Google screen — done.</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Not sure which email? Ask your chairperson — they can see it on the Members page,
                or send you a fresh invite to a new address.
              </p>
            </div>
          )}

          <Button
            onClick={signIn}
            disabled={busy}
            className="mt-6 h-12 w-full rounded-xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90"
          >
            <svg viewBox="0 0 24 24" className="mr-3 h-5 w-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
            {busy ? "Opening Google…" : "Continue with Google"}
          </Button>

          {intent === "join" && (
            <p className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              Tip: use the same email address your chairperson invited. If you sign in with a different
              email, we won't find you in any chama.
            </p>
          )}

          {!intent && (
            <div className="mt-4 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Starting a new chama?</span>{" "}
              <Link to="/start" className="font-medium text-primary hover:underline">
                See the 3 steps for chairpersons →
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our records-only terms. We never hold your money.
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-navy p-6 text-navy-foreground lg:flex lg:p-12">
        <div className="text-sm font-medium opacity-70">Built for Kenyan chamas</div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Transparent records.<br />Trusted by every member.
          </h2>
          <p className="mt-4 max-w-md text-base opacity-80">
            Every contribution, loan and edit is logged so the whole chama can see what happened —
            and who changed it.
          </p>
        </div>
        <div className="text-xs opacity-60">© 2026 Chama-OS. Records-only.</div>
      </div>
    </div>
  );
}
