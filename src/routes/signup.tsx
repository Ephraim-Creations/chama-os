import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sprout, Mail, Lock, User, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({
    meta: [
      { title: "Sign up — Chama-OS" },
      { name: "description", content: "Create your Chama-OS account." },
    ],
  }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Validate form
      const result = signupSchema.safeParse(formData);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (authError) {
        toast.error(authError.message || "Sign-up failed");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        setLoading(false);
        return;
      }

      // Create profile
      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't fail the signup if profile creation fails - user can update later
      }

      const hasSession = Boolean(authData.session);
      if (!hasSession) {
        setSuccess(true);
        setPendingVerification(true);
        toast.success("Account created! Check your email to verify and then sign in.");
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 1500);
        return;
      }

      setSuccess(true);
      setPendingVerification(false);
      toast.success("Account created! Let's set up your chama.");

      // Land in the dashboard; the structured onboarding lives there.
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 1500);
    } catch (err) {
      toast.error("Sign-up failed. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {formData.fullName.split(" ")[0]}! 👋</h1>
            <p className="mt-4 text-muted-foreground">
              {pendingVerification
                ? "Your account was created. Check your email for a verification link, then sign in."
                : "Your account is all set. Now let's create your first chama and add members."}
            </p>
            {!pendingVerification && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold">1</div>
                  <span>Enter your chama name</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold">2</div>
                  <span>Set the rules and contribution amounts</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-semibold">3</div>
                  <span>Invite members and assign roles</span>
                </div>
              </div>
            )}
            <Loader2 className="h-6 w-6 animate-spin mx-auto mt-8 text-primary" />
            <p className="mt-4 text-xs text-muted-foreground">
              {pendingVerification ? "Redirecting to login..." : "Redirecting to setup..."}
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

          <h1 className="mt-8 sm:mt-10 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
          <p className="mt-2 text-[15px] text-muted-foreground">Join Chama-OS and start managing your chama transparently.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-11"
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-6 h-11 w-full rounded-xl bg-foreground text-background text-[15px] font-semibold hover:bg-foreground/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By creating an account you agree to our records-only terms. We never hold your money.
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
