import { useState } from "react";
import logoImage from "@/assets/chama-OS-logo.png";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/marketing.functions";

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      await subscribeToNewsletter({ data: { email, source: "footer" } });
      setState("done");
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe.");
      setState("idle");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 md:flex md:items-center md:justify-between md:gap-8">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Mail className="h-4 w-4 text-primary" /> Chama-OS newsletter
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Practical tips on running a transparent chama, plus product updates. No spam.
          </p>
        </div>
        {state === "done" ? (
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-success md:mt-0">
            <CheckCircle2 className="h-4 w-4" /> You&apos;re on the list — asante!
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 flex w-full max-w-md gap-2 md:mt-0">
            <input
              type="email"
              required
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              type="submit"
              disabled={state === "saving"}
              className="h-11 shrink-0 rounded-xl px-5 font-semibold"
            >
              {state === "saving" ? "Joining…" : "Subscribe"}
            </Button>
          </form>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function PageFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 pt-10">
      <NewsletterSignup />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border px-4 py-8 md:flex-row md:px-8">
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground md:flex-row md:gap-2">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="Chama-OS" className="h-7 w-7" />
            © 2026 Chama-OS · Records-only
          </div>
          <span className="hidden md:inline">·</span>
          <a
            href="https://www.ephraimcreations.co.ke/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary font-semibold"
          >
            Powered by Ephraim Creations
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <a href="/about" className="hover:text-foreground">About</a>
          <a href="/contact" className="hover:text-foreground">Contact</a>
          <a href="/#pricing" className="hover:text-foreground">Pricing</a>
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/terms" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
