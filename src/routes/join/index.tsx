import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserPlus, Mail, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";

export const Route = createFileRoute("/join/")({
  component: JoinPage,
  head: () => ({
    meta: [
      { title: "Join Chama-OS — invite-only access" },
      {
        name: "description",
        content:
          "Chama-OS is invite-only. Members are added by their chama chairperson. Chairpersons apply to open a group.",
      },
      { property: "og:title", content: "Join Chama-OS — invite-only access" },
      {
        property: "og:description",
        content: "Members are added by their chairperson. Chairpersons apply to open a chama.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const steps = [
  {
    icon: ShieldCheck,
    title: "Access is invite-only",
    body: "Nobody signs themselves up. Your chama chairperson adds your email to the group's member list first.",
  },
  {
    icon: Mail,
    title: "Sign in with that exact email",
    body: "Use the same email your chair added — with Google, a one-time link, or your password. A different email won't be found.",
  },
  {
    icon: UserPlus,
    title: "Starting a new chama?",
    body: "Apply as a chairperson. We review every application by hand and get back to you, then you set up your group.",
  },
];

function JoinPage() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Invite-only
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          How people get into Chama-OS
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          We keep every chama's records private, so only people their chairperson has added can sign in.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </div>
                <div className="mt-0.5 text-lg font-semibold text-foreground">{s.title}</div>
                <p className="mt-1 text-[15px] text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">I was added by my chair</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in with the email your chairperson used.
            </p>
            <Button asChild className="mt-5 h-11 w-full rounded-xl font-semibold">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Sign in
              </Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <h2 className="text-lg font-semibold text-foreground">I'm a chama chairperson</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Send us your details and we'll open your group.
            </p>
            <Button asChild variant="outline" className="mt-5 h-11 w-full rounded-xl font-semibold">
              <Link to="/join/apply">
                Apply to open a chama <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
