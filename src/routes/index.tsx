import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";
import {
  ShieldCheck, Wallet, HandCoins, CalendarDays, MessageSquare,
  Users, TrendingUp, ArrowRight, CheckCircle2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroDark from "@/assets/hero-dark.png";
import heroLight from "@/assets/hero-light.jpg";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Chama-OS — Transparent records for every chama" },
      { name: "description", content: "Track savings, loans, meetings, investments and member activity in one transparent system built for Kenyan chamas." },
      { property: "og:title", content: "Chama-OS — Transparent records for every chama" },
      { property: "og:description", content: "Track savings, loans, meetings and investments in one transparent system for Kenyan chamas." },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <Hero />
      <ProductOfEphraimCreations />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <PageFooter />
    </div>
  );
}

// Branded section: Product of Ephraim Creations
function ProductOfEphraimCreations() {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 bg-gradient-to-b from-primary/10 to-background border-b border-border">
      <div className="mx-auto max-w-3xl px-4 md:px-0 text-center">
        <div className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold text-primary mb-4">
          About the makers
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
          A product of <span className="text-primary">Ephraim Creations</span>
        </h2>
        <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground mb-8">
          Chama-OS is crafted by Ephraim Creations — a studio on a mission to digitize the world and eliminate manual bookkeeping by building innovative, people-first systems. We design tools that feel effortless, respect your privacy, and help you do your best work.
        </p>
        <a
          href="https://www.ephraimcreations.co.ke/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/90 px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm hover:bg-primary"
        >
          Visit Ephraim Creations
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

// (Legacy inline Nav() removed — we use the shared <Navbar /> component.)

function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const heroImg = mounted && resolvedTheme === "light" ? heroLight : heroDark;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:pb-16 pt-16 sm:pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Records-only · We never hold your money
          </div>
          <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Transparent records for <span className="text-primary">every chama</span>.
          </h1>
          <p className="mx-auto mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Track savings, loans, meetings, investments and financial activity in one transparent
            system. Every member sees the same truth — in real time.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="h-12 rounded-xl px-6 text-[15px] font-semibold">
              <Link to="/start">
                Create my Chama <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-xl px-6 text-[15px]">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-14 max-w-6xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <img
              src={heroImg}
              alt="Chama-OS dashboard preview showing savings analytics, member contributions and KPIs"
              width={1920}
              height={1080}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    "Missing or contested contribution records",
    "Financial mistrust between members and treasurers",
    "WhatsApp groups full of forwarded screenshots",
    "Physical books that get lost or rewritten",
    "No clear history of who paid, who borrowed",
  ];
  return (
    <section className="border-t border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-primary">The problem</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Most chamas run on memory, paper, and trust nobody can verify.
            </h2>
          </div>
          <ul className="space-y-3">
            {items.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">✕</span>
                <span className="text-[15px]">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Solution() {
  const items = [
    { icon: ShieldCheck, title: "Transparency logs", body: "Every edit is recorded with who, when, and what changed." },
    { icon: Wallet, title: "Savings tracking", body: "Per-member balances any member can see at any time." },
    { icon: HandCoins, title: "Loan tracking", body: "Applications, guarantors, approvals and repayments — all visible." },
    { icon: CalendarDays, title: "Meeting minutes", body: "Agendas, attendance and minutes stored in one place." },
    { icon: TrendingUp, title: "Analytics dashboard", body: "Charts that show where the money came from and where it went." },
    { icon: Users, title: "Member roles", body: "Chairperson, Treasurer, Secretary, Member — each with the right access." },
  ];
  return (
    <section id="solution" className="py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">The solution</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            One transparent system. Every member sees the truth.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const features = [
    { icon: ShieldCheck, title: "Financial transparency", body: "Append-only logs so nobody can quietly rewrite history." },
    { icon: HandCoins, title: "Loan management", body: "Apply, attach guarantors, get treasurer and chair approval." },
    { icon: TrendingUp, title: "Savings analytics", body: "Beautiful charts for growth, contributions and repayments." },
    { icon: CalendarDays, title: "Meetings & minutes", body: "Schedule sittings, log attendance, publish official minutes." },
    { icon: MessageSquare, title: "Community chat", body: "Discussions and announcements without WhatsApp chaos." },
    { icon: Users, title: "Role management", body: "Chair assigns roles. No member self-promotes to treasurer." },
  ];
  return (
    <section
      id="features"
      className={`border-t py-20 ${
        isDark
          ? "border-slate-800 bg-slate-950 text-slate-50"
          : "border-border bg-white text-foreground"
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className={`text-sm font-semibold uppercase tracking-wider ${isDark ? "opacity-70" : ""}`}>
            Features
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            A complete operating system for your chama.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-6 ${
                isDark
                  ? "border-slate-700 bg-slate-900"
                  : "border-border bg-gray-50"
              }`}
            >
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${
                isDark
                  ? "bg-primary/35 text-primary-foreground"
                  : "bg-primary/25 text-primary"
              }`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 text-lg font-semibold">{f.title}</div>
              <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-muted-foreground"}`}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, title: "Chair creates the chama", body: "Sign in with Google and set up your group in under a minute. You become the Chairperson." },
    { n: 2, title: "Chair invites by email", body: "Add member emails and assign each a role — Treasurer, Secretary, or Member." },
    { n: 3, title: "Members sign in with Google", body: "They use the same email you invited. The system signs them straight into your chama." },
    { n: 4, title: "Everyone tracks the truth", body: "Contributions, loans, meetings and analytics — visible to every member in real time." },
  ];
  return (
    <section id="how" className="py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">From zero to a running chama in minutes.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                {s.n}
              </div>
              <div className="mt-4 text-lg font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Essential",
      price: "Free",
      tagline: "For new chamas finding their feet.",
      features: [
        "Up to 15 members",
        "Savings & contribution tracking",
        "Meeting minutes & attendance",
        "Transparency log (basic)",
      ],
      cta: "Start free",
      highlight: false,
    },
    {
      name: "Plus",
      price: "KSh 999",
      suffix: "/ month",
      tagline: "For growing chamas that need more structure and accountability.",
      features: [
        "Up to 50 members",
        "Savings & contribution tracking",
        "Loan tracking",
        "Meeting minutes & attendance",
        "Transparency log",
        "Email invites & member roles",
      ],
      cta: "Choose Plus",
      highlight: false,
    },
    {
      name: "Growth",
      price: "KSh 1,500",
      suffix: "/ month",
      tagline: "For active chamas managing loans and investments.",
      features: [
        "Up to 100 members",
        "Loan applications & guarantors",
        "Investment tracking",
        "Full transparency log with edit history",
        "Email invites & role management",
      ],
      cta: "Choose Growth",
      highlight: true,
    },
    {
      name: "Federation",
      price: "Custom",
      tagline: "For SACCOs and multi-chama networks.",
      features: [
        "Unlimited members",
        "Multiple chamas under one roof",
        "Priority support",
        "Custom reporting & exports",
      ],
      cta: "Talk to us",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="border-t border-border bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Simple plans that grow with your chama.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade when your members and money grow.
          </p>
        </div>
        <div className="mt-12 grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={
                "relative flex h-full flex-col rounded-2xl border bg-card p-7 " +
                (t.highlight
                  ? "border-primary shadow-xl shadow-primary/15 md:-translate-y-2"
                  : "border-border")
              }
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most popular
                </div>
              )}
              <div className="text-lg font-semibold">{t.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="text-3xl font-bold tracking-tight">{t.price}</div>
                {t.suffix && <div className="text-sm text-muted-foreground">{t.suffix}</div>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={t.highlight ? "default" : "outline"}
                className="mt-auto h-11 rounded-xl font-semibold"
              >
                <Link to="/start">{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Records-only platform. Chama-OS never holds your money.
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="px-4 pb-20 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-10 text-center shadow-xl md:p-16">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
          Every member can see where the money goes.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          That's the actual product. Not AI. Not charts. Trust.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-12 rounded-xl px-6 text-[15px] font-semibold">
            <Link to="/start">
              Create my Chama <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-xl px-6 text-[15px]">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground md:flex-row md:gap-2">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-4 w-4" />
            </div>
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
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="/privacy" className="hover:text-foreground">Privacy</a>
          <a href="/terms" className="hover:text-foreground">Terms</a>
        </div>
      </div>
    </footer>
  );
}
