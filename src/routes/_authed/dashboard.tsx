import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, HandCoins, Users, Clock, Plus, Download, Settings2, X,
  Sparkles, CalendarDays, UserPlus, FileBarChart, PiggyBank, ArrowRight, CheckCircle2,
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
  ksh, savingsGrowth, contributionBreakdown, loanAnalytics,
  recentContributions, topContributors, meetings as upcomingMeetings,
  notifications as feedNotifications,
} from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { ROLE_LABELS } from "@/lib/permissions";
import { InviteMemberDialog } from "@/components/InviteMemberDialog";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { active, chamas, loading } = useChama();
  const { user } = useAuth();
  const { role, can, isChair } = usePermissions();

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

  if (!loading && !active && chamas.length === 0) {
    return <DashboardOnboarding />;
  }

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  const quickActions = [
    { label: "Add contribution", icon: Plus, to: "/contributions", show: can("finance.manage") },
    { label: "Add member", icon: UserPlus, to: "/members", show: can("members.manage") },
    { label: "Create meeting", icon: CalendarDays, to: "/meetings", show: can("meetings.manage") },
    { label: "Issue loan", icon: HandCoins, to: "/loans", show: can("loans.manage") },
    { label: "Record investment", icon: PiggyBank, to: "/investments", show: can("investments.manage") },
    { label: "Download report", icon: FileBarChart, to: "/reports", show: can("reports.view") },
  ].filter((a) => a.show);

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Welcome banner */}
      <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:flex sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">
            {greeting()}, {firstName} 👋
          </div>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {active?.name ?? "Your chama"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {role && (
              <Badge className="bg-primary/10 font-semibold text-primary hover:bg-primary/10">
                {ROLE_LABELS[role]}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Here is how your group is doing this month.
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {isChair && active && setupDismissed && (
            <Button
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => {
                if (!setupKey) return;
                window.localStorage.removeItem(setupKey);
                setSetupDismissed(false);
              }}
            >
              <Settings2 className="mr-2 h-4 w-4" /> Customize
            </Button>
          )}
          <Button variant="outline" className="h-11 rounded-xl">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {isChair && active && !setupDismissed && (
        <div className="relative mb-6 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
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
                Invite members by email and assign their roles. Reopen anytime via Customize.
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

      {/* Quick actions */}
      {quickActions.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {quickActions.map((a) => (
            <Button
              key={a.label}
              asChild
              variant="outline"
              className="h-auto justify-start rounded-2xl border-border px-4 py-4 text-left"
            >
              <Link to={a.to}>
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <span className="truncate text-sm font-semibold">{a.label}</span>
                </span>
              </Link>
            </Button>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Members" value="42" trend={5} icon={Users} accent="navy" />
        <KpiCard label="Total savings" value={ksh(2_540_000)} trend={12} icon={Wallet} accent="primary" />
        <KpiCard label="Active loans" value={ksh(540_000)} trend={-4} icon={HandCoins} accent="warning" />
        <KpiCard label="Investments" value={ksh(890_000)} trend={9} icon={TrendingUp} accent="info" />
        <KpiCard label="Monthly collection" value={ksh(320_000)} trend={6} icon={CheckCircle2} accent="primary" />
        <KpiCard label="Pending approvals" value="4" icon={Clock} accent="destructive" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Monthly contributions"
          subtitle="Collections across the last 7 months"
          className="lg:col-span-2"
          right={<Badge className="bg-success/10 font-semibold text-success hover:bg-success/10">+12.4%</Badge>}
        >
          <div className="h-72">
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
        </Panel>

        <Panel title="Money distribution" subtitle="Where the group's money sits">
          <div className="h-56">
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
        </Panel>
      </div>

      {/* Loans + goals */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Loan repayment" subtitle="Active vs. repaid by month" className="lg:col-span-2">
          <div className="h-72">
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
        </Panel>

        <Panel title="Goals & health" subtitle="Financial health score 92% — excellent">
          <div className="space-y-5">
            <GoalBar label="Buy land" current={720_000} target={1_000_000} />
            <GoalBar label="Purchase bus" current={400_000} target={1_000_000} />
            <GoalBar label="Emergency fund" current={320_000} target={500_000} />
          </div>
          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
            <div className="text-sm font-semibold text-foreground">Insights</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Contributions increased by 18% this quarter.</li>
              <li>Loan defaults reduced by 6%.</li>
              <li>Emergency fund is below target.</li>
            </ul>
          </div>
        </Panel>
      </div>

      {/* Activity + meetings + notifications */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Recent activity" subtitle="What happened lately">
          <div className="space-y-4">
            {recentContributions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {c.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {c.member} paid {ksh(c.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">{c.type} · {c.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming meetings" subtitle="RSVP and agenda">
          <div className="space-y-3">
            {upcomingMeetings.slice(0, 4).map((m: any) => (
              <div key={m.id ?? m.title} className="rounded-xl border border-border p-3">
                <div className="text-sm font-semibold text-foreground">{m.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {m.date} {m.time ? `· ${m.time}` : ""} {m.location ? `· ${m.location}` : ""}
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="ghost" className="mt-4 h-10 w-full rounded-xl">
            <Link to="/meetings">
              View calendar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Panel>

        <Panel title="Notifications" subtitle="Things needing attention">
          <div className="space-y-3">
            {feedNotifications.slice(0, 5).map((n: any, i: number) => (
              <div key={n.id ?? i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <div className="text-sm text-foreground">{n.title ?? n.text ?? n.message}</div>
                  {n.time && <div className="text-xs text-muted-foreground">{n.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Top contributors */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Top contributors" subtitle="By total savings">
          <div className="space-y-4">
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
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold text-foreground">{i + 1}. {m.name}</div>
                        <div className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{ksh(m.savings)}</div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{m.role}</div>
                    </div>
                  </div>
                  <Progress value={(m.savings / max) * 100} className="mt-2 h-1.5" />
                </div>
              );
            })}
          </div>
        </Panel>

        {/* Recent transactions */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3 p-5">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Recent transactions</h2>
              <p className="text-sm text-muted-foreground">Latest entries from your members</p>
            </div>
            <Button asChild variant="outline" className="h-10 shrink-0 rounded-xl">
              <Link to="/contributions">View all</Link>
            </Button>
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
                        <div className="min-w-0">
                          <div className="truncate font-medium text-foreground">{c.member}</div>
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
    </div>
  );
}

function Panel({
  title, subtitle, children, right, className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className ?? ""}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function GoalBar({ label, current, target }: { label: string; current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <Progress value={pct} className="mt-2 h-2" />
      <div className="mt-1 text-xs text-muted-foreground">
        {ksh(current)} of {ksh(target)}
      </div>
    </div>
  );
}

function DashboardOnboarding() {
  const steps = [
    { icon: Sparkles, title: "Name your chama", body: "Add the basics — name, type, location and a short description." },
    { icon: Settings2, title: "Set the rules", body: "Contribution amount, frequency, meeting cadence and quorum. Edit anytime." },
    { icon: Users, title: "Invite your members", body: "Add treasurer, secretary and members by email. They join when they sign in." },
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
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
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
            <Link to="/create-chama">
              <Plus className="mr-2 h-4 w-4" /> Set up my chama
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 flex-1 rounded-xl text-[15px]">
            <Link to="/members">Add members</Link>
          </Button>
        </div>
      </div>
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
