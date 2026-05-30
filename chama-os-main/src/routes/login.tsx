import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sprout, AlertTriangle, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({
  intent: z.enum(["create", "join"]).optional(),
  invite: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destinationFor(intent) });
    });
  }, [navigate, intent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("login result", { data, error });

      if (error) {
        setFormError(error.message || "Sign-in failed");
        toast.error(error.message || "Sign-in failed");
        setLoading(false);
        return;
      }

      if (!data?.session) {
        const msg =
          "Sign-in did not return an active session. Check your email if account verification is required.";
        setFormError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      setFormError(null);
      navigate({ to: destinationFor(intent) });
    } catch (err) {
      toast.error("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  const heading =
    intent === "create" ? "Create your chama"
    : intent === "join" ? "Join your chama"
    : "Karibu 👋 Sign in to your chama";

  const sub =
    intent === "create"
      ? "Sign in with your email to set up your chama. You'll become the Chairperson."
      : intent === "join"
      ? "Sign in with the email your chairperson invited."
      : "Sign in with your email to access your chama dashboard.";

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col justify-center px-4 py-8 sm:px-6 md:px-12 md:py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-md">
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

          {formError && (
            <Alert className="mt-6 border-destructive bg-destructive/10 text-destructive-foreground">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Email Field */}
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
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password Field */}
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
                  className="pl-10 pr-10 h-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              <div className="flex justify-end">
                <Link to="/auth/reset-password" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 w-full rounded-xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>

          {intent === "join" && (
            <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Tip:</span> Use the same email address your chairperson invited. If you sign in with a different email, we won't find you in any chama.
            </div>
          )}

          {!intent && (
            <div className="mt-4 rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Starting a new chama?</span>{" "}
              <Link to="/start" className="font-medium text-primary hover:underline">
                See the 3 steps →
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
