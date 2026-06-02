import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sprout, UserPlus, Users, ShieldCheck, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/start")({
  component: StartPage,
  head: () => ({
    meta: [
      { title: "Before you create your chama — Chama-OS" },
      { name: "description", content: "A simple 3-step guide for chairpersons setting up a new chama on Chama-OS." },
    ],
  }),
});

function StartPage() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. You sign in (as the Chairperson)",
      body: "Use your own Google account. The email you sign in with becomes the Chairperson's email — keep it safe, you'll use it every time.",
    },
    {
      icon: Sprout,
      title: "2. You name your chama",
      body: "Just the name, type and town. Takes less than a minute. If your chama is already on Chama-OS we'll spot it and help you open it instead of making a duplicate.",
    },
    {
      icon: Users,
      title: "3. You invite your members by email",
      body: "Add each member's email. When they sign in with Google using that same email, they're in — no codes, no passwords to remember.",
    },
  ];

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="font-bold tracking-tight text-sm sm:text-base truncate">Chama-OS</div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Records-only · We never hold your money
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
          Setting up your chama takes 3 small steps.
        </h1>
        <p className="mt-3 text-[15px] text-muted-foreground md:text-base">
          You're about to become the <span className="font-semibold text-foreground">Chairperson</span>. Here's
          exactly what happens — read once, then we'll walk you through it.
        </p>

        <ol className="mt-8 space-y-4">
          {steps.map((s) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[15px] font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Important:</span> the Google email you sign in with
            is your chama's master account. Use one you check regularly — members and your treasurer will need
            you to add them.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 flex-1 rounded-xl text-[15px] font-semibold">
            <Link to="/login" search={{ intent: "create" }}>
              I'm ready — sign in with Google <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1 rounded-xl text-[15px]">
            <Link to="/login">I'm a member — sign me in</Link>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help? Ask anyone who's already on Chama-OS, or have your chairperson send you a fresh invite.
        </p>
      </main>
    </div>
  );
}
