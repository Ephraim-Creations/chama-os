import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Sprout, Mail, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const searchSchema = z.object({
  type: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset Password — Chama-OS" },
      { name: "description", content: "Reset your Chama-OS password." },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { type } = useSearch({ from: "/auth/reset-password" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [sessionVerified, setSessionVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if user has a valid session (from email link)
  useEffect(() => {
    const verifySession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && type === "recovery") {
        setSessionVerified(true);
        setStep("reset");
      }
    };
    verifySession();
  }, [type]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (!email) {
        setErrors({ email: "Email is required" });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?type=recovery`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        setLoading(false);
        return;
      }

      toast.success("Check your email for the password reset link!");
      setStep("success");
    } catch (err) {
      toast.error("Failed to send reset email. Please try again.");
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const result = resetSchema.safeParse({ password, confirmPassword });
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        setLoading(false);
        return;
      }

      toast.success("Password reset successfully!");
      setStep("success");
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-8 sm:px-6 md:px-12 md:py-12">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          <div className="mx-auto w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {sessionVerified ? "Password reset!" : "Check your email"}
            </h1>
            <p className="mt-4 text-muted-foreground">
              {sessionVerified
                ? "Your password has been reset successfully. You can now sign in with your new password."
                : "We've sent a password reset link to your email. Click it to reset your password."}
            </p>
            <Button
              onClick={() => navigate({ to: "/login" })}
              className="mt-8 h-11 w-full rounded-xl bg-foreground text-background font-semibold hover:bg-foreground/90"
            >
              Go to Sign in
            </Button>
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

          <h1 className="mt-8 sm:mt-10 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {step === "email" ? "Forgot your password?" : "Create a new password"}
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {step === "email"
              ? "Enter your email address and we'll send you a link to reset your password."
              : "Enter your new password below."}
          </p>

          {!sessionVerified && step === "reset" && (
            <Alert className="mt-6 border-amber-600 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                Your reset link has expired. <Link to="/auth/reset-password" className="font-semibold underline">Request a new one →</Link>
              </AlertDescription>
            </Alert>
          )}

          {step === "email" && (
            <form onSubmit={handleRequestReset} className="mt-8 space-y-4">
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

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 h-11 w-full rounded-xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}

          {step === "reset" && sessionVerified && (
            <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  New password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 h-11"
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
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 h-11"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 h-11 w-full rounded-xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
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
