import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Sprout,
  Wand2,
  Delete,
  KeyRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { pinSignIn } from "@/lib/pins.functions";
import { toast } from "sonner";

const searchSchema = z.object({
  invite: z.string().optional(),
});

const emailSchema = z.string().trim().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Chama-OS" },
      {
        name: "description",
        content: "Sign in to your chama's records with the email your chairperson added.",
      },
      { property: "og:title", content: "Sign in — Chama-OS" },
      {
        property: "og:description",
        content: "Sign in to your chama's records with the email your chairperson added.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicBusy, setMagicBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"pin" | "email">("email");
  const [pin, setPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  const handlePinSignIn = async (code: string) => {
    setFormError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors({ email: parsed.error.errors[0].message });
      return;
    }
    setPinBusy(true);
    try {
      const { tokenHash } = await pinSignIn({ data: { email: parsed.data, pin: code } });
      const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
      if (error) {
        setFormError("Could not start your session. Please use your password.");
        setPin("");
        return;
      }
      navigate({ to: "/dashboard" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Email or PIN is not correct.");
      setPin("");
    } finally {
      setPinBusy(false);
    }
  };

  const pressKey = (digit: string) => {
    if (pinBusy) return;
    const next = (pin + digit).slice(0, 4);
    setPin(next);
    if (next.length === 4) void handlePinSignIn(next);
  };



  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);

    const parsedEmail = emailSchema.safeParse(email);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedEmail.success || !parsedPassword.success) {
      setErrors({
        ...(parsedEmail.success ? {} : { email: parsedEmail.error.errors[0].message }),
        ...(parsedPassword.success ? {} : { password: parsedPassword.error.errors[0].message }),
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: parsedEmail.data,
        password,
      });
      if (error) {
        setFormError(error.message || "Sign-in failed");
        return;
      }
      if (!data?.session) {
        setFormError("Sign-in did not return an active session. Try the one-time link instead.");
        return;
      }
      navigate({ to: "/dashboard" });
    } catch {
      setFormError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    setErrors({});
    setFormError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors({ email: parsed.error.errors[0].message });
      return;
    }
    setMagicBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: parsed.data,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) {
        setFormError(error.message || "Could not send the link.");
        return;
      }
      setMagicSent(true);
      toast.success("Check your email for the sign-in link.");
    } finally {
      setMagicBusy(false);
    }
  };

  const handleGoogle = async () => {
    setFormError(null);
    setGoogleBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setFormError(result.error.message || "Google sign-in failed.");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/dashboard" });
    } catch {
      setFormError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleBusy(false);
    }
  };

  const busy = loading || magicBusy || googleBusy;

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-8 sm:px-6 md:px-12 md:py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="grid h-9 w-9 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold text-foreground truncate">Chama-OS</div>
              <div className="text-xs text-muted-foreground line-clamp-1">Transparent records</div>
            </div>
          </Link>

          <h1 className="mt-8 sm:mt-10 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Karibu 👋 Sign in to your chama
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Use the same email your chairperson added to the group.
          </p>

          {formError && (
            <Alert className="mt-6 border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <AlertDescription className="font-medium text-destructive">{formError}</AlertDescription>
            </Alert>
          )}

          {magicSent && (
            <Alert className="mt-6 border-primary/40 bg-primary/5">
              <Mail className="h-4 w-4 text-primary" />
              <AlertDescription className="font-medium text-foreground">
                We sent a sign-in link to {email}. Open it on this device.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-8 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(["pin", "email"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setFormError(null);
                  setPin("");
                }}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "pin" ? <KeyRound className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                {m === "pin" ? "Touch PIN" : "Email"}
              </button>
            ))}
          </div>

          {mode === "email" && (
          <>
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={busy}
            className="mt-8 h-11 w-full rounded-xl text-[15px] font-semibold"
          >
            {googleBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleMark />}
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10"
                  disabled={busy}
                />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={busy}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              <div className="flex justify-end">
                <Link to="/auth/reset-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="mt-2 h-11 w-full rounded-xl text-[15px] font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <Button
            type="button"
            variant="ghost"
            onClick={handleMagicLink}
            disabled={busy}
            className="mt-3 h-11 w-full rounded-xl text-[15px] font-medium"
          >
            {magicBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Email me a one-time sign-in link
          </Button>
          </>
          )}

          {mode === "pin" && (
            <div className="mt-8">
              <div className="space-y-2">
                <label htmlFor="pin-email" className="text-sm font-medium text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="pin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10"
                    disabled={pinBusy}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="mt-6 flex justify-center gap-3" aria-label="PIN entry">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-4 w-4 rounded-full border-2 transition-colors ${
                      pin.length > i ? "border-primary bg-primary" : "border-border bg-transparent"
                    }`}
                  />
                ))}
              </div>

              <div className="mx-auto mt-6 grid max-w-xs grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => pressKey(d)}
                    disabled={pinBusy}
                    className="h-14 rounded-xl border border-border bg-card text-xl font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {d}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin("")}
                  disabled={pinBusy}
                  className="h-14 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => pressKey("0")}
                  disabled={pinBusy}
                  className="h-14 rounded-xl border border-border bg-card text-xl font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPin((p) => p.slice(0, -1))}
                  disabled={pinBusy}
                  className="grid h-14 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  aria-label="Delete last digit"
                >
                  <Delete className="h-5 w-5" />
                </button>
              </div>

              <Button
                type="button"
                disabled={pinBusy || pin.length !== 4}
                onClick={() => void handlePinSignIn(pin)}
                className="mt-6 h-11 w-full rounded-xl text-[15px] font-semibold"
              >
                {pinBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pinBusy ? "Signing in..." : "Sign in with PIN"}
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Set your PIN in Settings after your first password sign-in.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">First time here?</span> Chama-OS is invite-only —
            your chairperson adds your email first.{" "}
            <Link to="/join" className="font-medium text-primary hover:underline">
              How it works →
            </Link>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our records-only terms. We never hold your money.
          </p>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-navy p-6 text-navy-foreground lg:flex lg:p-12">
        <div className="text-sm font-medium opacity-70">Built for Kenyan chamas</div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Transparent records.
            <br />
            Trusted by every member.
          </h2>
          <p className="mt-4 max-w-md text-base opacity-80">
            Every contribution, loan and edit is logged so the whole chama can see what happened — and who
            changed it.
          </p>
        </div>
        <div className="text-xs opacity-60">© 2026 Chama-OS. Records-only.</div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"
      />
    </svg>
  );
}
