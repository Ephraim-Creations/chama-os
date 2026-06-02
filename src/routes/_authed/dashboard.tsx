import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet, TrendingUp, HandCoins, CheckCircle2, Users, Clock, Plus, Download,
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
  const { active } = useChama();
  const isChair = active?.role === "chairperson";

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title={active ? active.name : "Dashboard"}
        description="A clear, transparent view of your chama's activity this month."
        actions={
          <>
            <Button variant="outline" className="h-11 rounded-xl text-[15px]">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button className="h-11 rounded-xl text-[15px] font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Record contribution
            </Button>
          </>
        }
      />

      {isChair && active && (
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">Your chama is ready.</div>
              <div className="text-sm text-muted-foreground">
                Next step: invite your members by email and assign their roles. They'll sign in with Google
                and land straight in this dashboard.
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <InviteMemberDialog chamaId={active.id} />
            <Button asChild variant="outline" className="h-11 rounded-xl">
              <Link to="/members">Manage members</Link>
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
