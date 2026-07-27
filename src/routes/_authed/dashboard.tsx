import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, HandCoins, Users, Clock, Plus, CalendarDays, UserPlus,
  FileBarChart, PiggyBank, CheckCircle2, Loader2, Inbox, Sparkles,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  PieChart, Pie, Cell,
} from "recharts";

import { KpiCard } from "@/components/KpiCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ksh, initialsOf } from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useSnapshot } from "@/hooks/use-snapshot";
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

const PIE_COLORS = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-warning)",
  "var(--color-destructive)",
  "var(--color-navy)",
];

function Dashboard() {
  const { active, loading: chamasLoading } = useChama();
  const { user } = useAuth();
  const { role, can, isChair } = usePermissions();
  const { snapshot, loading } = useSnapshot();

  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "there";

  if (chamasLoading || (loading && !snapshot)) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <EmptyState
          icon={Sparkles}
          title="No chama yet"
          description="Finish setting up your group to unlock the dashboard."
          action={
            <Button asChild className="mt-2 h-11 rounded-xl font-semibold">
              <Link to="/onboarding">Set up my chama</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const t = snapshot?.totals;
  const hasContributions = (snapshot?.contributions.length ?? 0) > 0;
  const hasMonthly = (snapshot?.monthly ?? []).some((m) => m.amount > 0);

  const quickActions = [
    { label: "Add contribution", icon: Plus, to: "/contributions", show: can("finance.manage") },
    { label: "Add member", icon: UserPlus, to: "/members", show: can("members.manage") },
    { label: "Create meeting", icon: CalendarDays, to: "/meetings", show: can("meetings.manage") },
    { label: "Issue loan", icon: HandCoins, to: "/loans", show: can("loans.manage") },
    { label: "Record investment", icon: PiggyBank, to: "/investments", show: can("investments.manage") },
    { label: "Download report", icon: FileBarChart, to: "/reports", show: can("reports.view") },
  ].filter((a) => a.show);

  const upcoming = (snapshot?.meetings ?? [])
    .filter((m) => new Date(m.scheduledAt).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))[0];

  const topMembers = [...(snapshot?.members ?? [])]
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-gradient-to-r from-primary/10 via-card to-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted-foreground">
            {greeting()}, {firstName} 👋
          </div>
          <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {active.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {role && (
              <Badge className="bg-primary/10 font-semibold text-primary hover:bg-primary/10">
                {ROLE_LABELS[role]}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {hasContributions
                ? "Here is how your group is doing this month."
                : "Nothing recorded yet — your numbers appear as you add data."}
            </span>
          </div>
        </div>
        {isChair && <InviteMemberDialog chamaId={active.id} />}
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Members" value={String(t?.members ?? 0)} icon={Users} accent="navy" />
        <KpiCard label="Total savings" value={ksh(t?.savings ?? 0)} icon={Wallet} accent="primary" />
        <KpiCard label="Active loans" value={ksh(t?.activeLoanValue ?? 0)} icon={HandCoins} accent="warning" />
        <KpiCard label="Investments" value={ksh(t?.investmentValue ?? 0)} icon={TrendingUp} accent="info" />
        <KpiCard label="This month" value={ksh(t?.monthlyCollection ?? 0)} icon={CheckCircle2} accent="primary" />
        <KpiCard label="Pending approvals" value={String(t?.pendingLoans ?? 0)} icon={Clock} accent="destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          title="Monthly contributions"
          subtitle="Collections across the last 6 months"
          className="lg:col-span-2"
        >
          {hasMonthly ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={snapshot?.monthly ?? []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" width={70} />
                  <Tooltip
                    formatter={(v: number) => ksh(v)}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                    }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#savings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No contributions recorded"
              description="Once the treasurer records contributions, the trend shows here."
            />
          )}
        </Panel>

        <Panel title="Contribution mix" subtitle="Where the money is going">
          {(snapshot?.breakdown.length ?? 0) > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={snapshot?.breakdown ?? []}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {(snapshot?.breakdown ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => ksh(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={PiggyBank} title="Nothing to break down yet" />
          )}
        </Panel>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="Recent contributions" className="lg:col-span-2">
          {hasContributions ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(snapshot?.contributions ?? []).slice(0, 6).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initialsOf(c.memberName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{c.memberName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{c.type}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(c.recordedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{ksh(c.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No entries yet"
              description="Record your first contribution to start the ledger."
              action={
                can("finance.manage") ? (
                  <Button asChild className="mt-2 h-10 rounded-xl">
                    <Link to="/contributions">Record contribution</Link>
                  </Button>
                ) : undefined
              }
            />
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Next meeting">
            {upcoming ? (
              <div>
                <div className="text-base font-semibold text-foreground">{upcoming.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {new Date(upcoming.scheduledAt).toLocaleString()}
                </div>
                {upcoming.location && (
                  <div className="text-sm text-muted-foreground">{upcoming.location}</div>
                )}
              </div>
            ) : (
              <EmptyState icon={CalendarDays} title="No meetings scheduled" />
            )}
          </Panel>

          <Panel title="Top savers">
            {topMembers.some((m) => m.savings > 0) ? (
              <ul className="space-y-3">
                {topMembers.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(m.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm font-medium text-foreground">{m.displayName}</span>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">{ksh(m.savings)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Users} title="No savings recorded yet" />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
