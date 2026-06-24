import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, HandCoins, CheckCircle2, Users, Clock, Plus, Download, Settings2, X,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";


import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ksh, kpis, savingsGrowth, contributionBreakdown, loanAnalytics,
  recentContributions, topContributors,
} from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});


const iconMap = { wallet: Wallet, trending: TrendingUp, loan: HandCoins, check: CheckCircle2, users: Users, clock: Clock };
const accentMap: Record<string, "primary" | "info" | "warning" | "destructive" | "navy"> = {
  savings: "primary", monthly: "info", loans: "warning",
  repay: "primary", members: "navy", pending: "destructive",
};

function formatKpi(k: typeof kpis[number]) {
  if (k.isPercent) return `${k.value}%`;
  if (k.isCount) return k.value.toLocaleString();
  return ksh(k.value);
}

function Dashboard() {
  const { active, chamas, loading } = useChama();
  const isChair = active?.role === "chairperson";
  const setupKey = active ? `chamaos.setupDismissed.${active.id}` : null;
  const [setupDismissed, setSetupDismissed] = useState(true);

  useEffect(() => {
    if (!setupKey) return;
    setSetupDismissed(window.localStorage.getItem(setupKey) === "1");
  }, [setupKey]);

  const dismissSetup = () => {
    if (!setupKey) return;
    window.localStorage.setItem(setupKey, "1");
    setSetupDismissed(true);
  };

  // Structured onboarding: no chama yet → guide the chair to create one
  // right from the dashboard instead of bouncing to an interstitial page.
  if (!loading && !active && chamas.length === 0) {
    return <DashboardOnboarding />;
  }



  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={active ? active.name : "Dashboard"}
        description="A clear, transparent view of your chama's activity this month."
        actions={
          <>
            {isChair && active && setupDismissed && (
              <Button
                variant="outline"
                className="h-11 rounded-xl text-[15px]"
                onClick={() => {
                  if (!setupKey) return;
                  window.localStorage.removeItem(setupKey);
                  setSetupDismissed(false);
                }}
              >
                <Settings2 className="mr-2 h-4 w-4" /> Customize
              </Button>
            )}
            <Button variant="outline" className="h-11 rounded-xl text-[15px]">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="h-11 rounded-xl text-[15px] font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Record contribution
            </Button>
          </>
        }
      />

      {isChair && active && !setupDismissed && (
        <div className="relative mb-6 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            aria-label="Dismiss setup"
            onClick={dismissSetup}
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">Set up your chama</div>
              <div className="text-sm text-muted-foreground">
                Invite members by email and assign their roles. You can reopen this anytime via Customize.
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <InviteMemberDialog chamaId={active.id} />
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link to="/members">Manage members</Link>
            </Button>
            <Button variant="ghost" className="h-11 rounded-xl" onClick={dismissSetup}>
              Done
            </Button>
          </div>
        </div>
      )}




      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={formatKpi(k)}
            trend={k.trend}
            icon={iconMap[k.icon as keyof typeof iconMap]}
            accent={accentMap[k.key]}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Savings growth */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Savings growth</h2>
              <p className="text-sm text-muted-foreground">Total savings across the last 7 months</p>
            </div>
            <Badge className="bg-success/10 font-semibold text-success hover:bg-success/10">+12.4%</Badge>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsGrowth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 13 }}
                  formatter={(v: number) => [ksh(v), "Savings"]}
                />
                <Area type="monotone" dataKey="savings" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#savings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Contribution breakdown</h2>
          <p className="text-sm text-muted-foreground">Where your money goes</p>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contributionBreakdown} dataKey="value" nameKey="name"
                  innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {contributionBreakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {contributionBreakdown.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-foreground">{d.name}</span>
                </div>
                <span className="font-semibold text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loans + Top contributors */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Loan analytics</h2>
              <p className="text-sm text-muted-foreground">Active vs. repaid loans by month</p>
            </div>
            <div className="hidden gap-4 text-sm sm:flex">
              <Stat label="Outstanding" value={ksh(380_000)} tone="warning" />
              <Stat label="Repayment rate" value="94%" tone="success" />
            </div>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanAnalytics} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="active" name="Active" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="repaid" name="Repaid" fill="var(--color-info)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Top contributors</h2>
              <p className="text-sm text-muted-foreground">By total savings</p>
            </div>
          </div>
          <div className="mt-4 space-y-4">
            {topContributors.map((m, i) => {
              const max = topContributors[0].savings;
              return (
                <div key={m.id}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {i + 1}. {m.name}
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-foreground">{ksh(m.savings)}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  </div>
                  <Progress value={(m.savings / max) * 100} className="mt-2 h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent contributions */}
      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Recent contributions</h2>
            <p className="text-sm text-muted-foreground">Latest entries from your chama members</p>
          </div>
          <Button variant="outline" className="h-10 rounded-xl">View all</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-foreground">Member</TableHead>
                <TableHead className="text-foreground">Type</TableHead>
                <TableHead className="text-foreground">Date</TableHead>
                <TableHead className="text-right text-foreground">Amount</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContributions.map((c) => (
                <TableRow key={c.id} className="text-[15px]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {c.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{c.member}</div>
                        <div className="text-xs text-muted-foreground">{c.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><TypeBadge type={c.type} /></TableCell>
                  <TableCell className="text-muted-foreground">{c.date}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{ksh(c.amount)}</TableCell>
                  <TableCell>
                    <Badge className={c.status === "Confirmed"
                      ? "bg-success/10 text-success hover:bg-success/10"
                      : "bg-warning/15 text-warning hover:bg-warning/15"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function DashboardOnboarding() {
  const steps = [
    {
      icon: Sparkles,
      title: "Name your chama",
      body: "Add the basics — name, type, location and a short description.",
    },
    {
      icon: Settings2,
      title: "Set the rules",
      body: "Contribution amount, frequency, meeting cadence and quorum. Edit anytime.",
    },
    {
      icon: Users,
      title: "Invite your members",
      body: "Add treasurer, secretary and members by email. They join when they sign in.",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Welcome to Chama-OS"
        description="You're signed in as the admin. Let's set up your first chama — it takes a couple of minutes."
      />
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Set up your chama</div>
            <p className="text-sm text-muted-foreground">
              You'll become the Chairperson and can invite members right after.
            </p>
          </div>
        </div>

        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4 rounded-xl border border-border bg-background p-4">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                {i + 1}
              </div>
              <div>
                <div className="text-[15px] font-semibold">{s.title}</div>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-12 flex-1 rounded-xl text-[15px] font-semibold">
            <Link to="/app/create">
              <Plus className="mr-2 h-4 w-4" /> Set up my chama
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1 rounded-xl text-[15px]">
            <Link to="/app">I was invited — find my chama</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "warning" | "success" }) {
  const cls = tone === "warning" ? "text-warning" : "text-success";
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-base font-bold ${cls}`}>{value}</div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    Savings: "bg-primary/10 text-primary hover:bg-primary/10",
    Welfare: "bg-info/10 text-info hover:bg-info/10",
    Project: "bg-warning/15 text-warning hover:bg-warning/15",
    Penalty: "bg-destructive/10 text-destructive hover:bg-destructive/10",
  };
  return <Badge className={map[type] ?? ""}>{type}</Badge>;
}
