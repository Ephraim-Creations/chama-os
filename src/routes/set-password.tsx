import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Sprout, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { setMyPin } from "@/lib/pins.functions";

export const Route = createFileRoute("/set-password")({
  component: SetPasswordPage,
  head: () => ({
    meta: [
      { title: "Set your password — Chama-OS" },
      {
        name: "description",
        content: "Create the password and PIN you will use to sign in to your chama on Chama-OS.",
      },
      { property: "og:title", content: "Set your password — Chama-OS" },
      {
        property: "og:description",
        content: "Create the password and PIN you will use to sign in to your chama.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const passwordSchema = z.string().min(8, "Use at least 8 characters");
const pinSchema = z.string().regex(/^\d{4}$/, "Your PIN must be exactly 4 digits");

function SetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setReady(Boolean(data.session));
      setEmail(data.session?.user.email ?? "");
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setReady(Boolean(session));
      setEmail(session?.user.email ?? "");
    });
    void check();
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const p = passwordSchema.safeParse(password);
    if (!p.success) return setError(p.error.errors[0].message);
    if (password !== confirm) return setError("The two passwords do not match");
    if (pin) {
      const parsedPin = pinSchema.safeParse(pin);
      if (!parsedPin.success) return setError(parsedPin.error.errors[0].message);
    }

    setBusy(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) {
        setError(upErr.message || "Could not save your password.");
        return;
      }
      if (pin) {
        try {
          await setMyPin({ data: { pin } });
        } catch {
          toast.error("Password saved, but the PIN could not be set. Try again in Settings.");
        }
      }
      toast.success("You're all set. Welcome to Chama-OS.");
      navigate({ to: "/dashboard" });
    } finally {
      setBusy(false);
    }
  }

  if (ready === null) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-destructive" />
          <h1 className="mt-3 text-xl font-semibold text-foreground">This link has expired</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Invitation links only work once and expire after a while. Ask your chairperson (or the
            Chama-OS team, if you applied to open a chama) to send a fresh one.
          </p>
          <Button asChild className="mt-5 h-11 rounded-xl font-semibold">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">Chama-OS</div>
            <div className="text-xs text-muted-foreground">Transparent records</div>
          </div>
        </Link>

        <h1 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
          Set up your sign-in
        </h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {email ? (
            <>
              You're setting up <span className="font-medium text-foreground">{email}</span>. Choose
              a password, and a 4-digit PIN for quick sign-ins.
            </>
          ) : (
            "Choose a password, and a 4-digit PIN for quick sign-ins."
          )}
        </p>

        {error && (
          <Alert className="mt-6 border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="font-medium text-destructive">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field id="password" label="New password" icon={Lock}>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="h-11 pl-10"
              disabled={busy}
            />
          </Field>

          <Field id="confirm" label="Confirm password" icon={Lock}>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it again"
              className="h-11 pl-10"
              disabled={busy}
            />
          </Field>

          <Field id="pin" label="4-digit PIN (optional)" icon={ShieldCheck}>
            <Input
              id="pin"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="e.g. 4821"
              className="h-11 pl-10 tracking-[0.4em]"
              disabled={busy}
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Your PIN lets you sign in fast on the shared chama device. Never share it.
          </p>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full rounded-xl text-[15px] font-semibold"
          >
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {busy ? "Saving..." : "Save and continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Lock;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
