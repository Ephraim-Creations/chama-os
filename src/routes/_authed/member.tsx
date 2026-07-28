import { createFileRoute } from "@tanstack/react-router";
import { Wallet, HandCoins, TrendingUp, CalendarDays, Loader2, Inbox, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { EmptyState } from "@/components/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ksh } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { useSnapshot } from "@/hooks/use-snapshot";

export const Route = createFileRoute("/_authed/member")({ component: Page });

function Page() {
  const { user } = useAuth();
  const { snapshot, loading } = useSnapshot();

  if (loading) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const me = (snapshot?.members ?? []).find((m) => m.userId === user?.id);
  const savings = me?.savings ?? 0;
  const penalties = me?.penalties ?? 0;
  const deductions = me?.deductions ?? 0;
  const myLoans = (snapshot?.loans ?? []).filter((l) => l.borrowerId === user?.id);
  const activeLoan = myLoans.find((l) => ["active", "approved", "overdue"].includes(l.status));
  const myEntries = (snapshot?.contributions ?? []).filter((c) => c.memberId === user?.id);
  const loanLimit = Math.max(me?.loanLimit ?? 0, 0);
  const multiplier = snapshot?.totals.loanMultiplier ?? 3;
  const myDeductions = (snapshot?.deductions ?? [])
    .map((d) => ({
      id: d.id,
      name: d.name,
      appliedOn: d.appliedOn,
      amount: d.members
        .filter((m) => m.memberId === user?.id)
        .reduce((a, m) => a + m.amount, 0),
    }))
    .filter((d) => d.amount > 0);
  const nextMeeting = (snapshot?.meetings ?? [])
    .filter((m) => new Date(m.scheduledAt).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt))[0];

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="My stats"
        description="Your own savings, penalties, loans and meetings — visible only to you."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="My savings" value={ksh(savings)} icon={Wallet} accent="primary" />
        <KpiCard label="My penalties" value={ksh(penalties)} icon={AlertTriangle} accent="warning" />
        <KpiCard label="Active loan balance" value={ksh(activeLoan ? activeLoan.amount - activeLoan.amountRepaid : 0)} icon={HandCoins} accent="info" />
        <KpiCard
          label="Loan eligibility"
          value={ksh(loanLimit)}
          icon={TrendingUp}
          accent="navy"
          hint={
            loanLimit > 0
              ? `${multiplier}x your savings`
              : "Save more to unlock a loan"
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="My deductions" value={ksh(deductions)} icon={Wallet} accent="warning" />
        <KpiCard label="My entries" value={String(myEntries.length)} icon={CalendarDays} accent="primary" />
      </div>


      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-lg font-semibold text-foreground">Loan repayment</div>
          {activeLoan ? (
            <>
              <p className="text-sm text-muted-foreground">
                {ksh(activeLoan.amountRepaid)} of {ksh(activeLoan.amount)} repaid
              </p>
              <Progress
                value={activeLoan.amount ? Math.round((activeLoan.amountRepaid / activeLoan.amount) * 100) : 0}
                className="mt-4 h-2"
              />
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge className="capitalize">{activeLoan.status.replace("_", " ")}</Badge>
              </div>
            </>
          ) : (
            <EmptyState icon={HandCoins} title="No active loan" description="You have no outstanding balance." />
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-lg font-semibold text-foreground">Next meeting</div>
          {nextMeeting ? (
            <>
              <p className="text-sm text-muted-foreground">{nextMeeting.title}</p>
              <div className="mt-4 text-base font-semibold text-foreground">
                {new Date(nextMeeting.scheduledAt).toLocaleString()}
              </div>
              {nextMeeting.location && (
                <div className="text-sm text-muted-foreground">{nextMeeting.location}</div>
              )}
            </>
          ) : (
            <EmptyState icon={CalendarDays} title="Nothing scheduled" />
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-lg font-semibold text-foreground">Deductions taken from me</div>
        {myDeductions.length === 0 ? (
          <EmptyState icon={Inbox} title="No deductions" description="Nothing has been deducted from your savings." />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {myDeductions.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[15px] font-medium text-foreground">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(d.appliedOn).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold tabular-nums text-warning">-{ksh(d.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-lg font-semibold text-foreground">My recent entries</div>
        {myEntries.length === 0 ? (
          <EmptyState icon={Inbox} title="No contributions yet" description="Your records appear here once the treasurer adds them." />
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {myEntries.slice(0, 8).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-[15px] font-medium capitalize text-foreground">{c.type}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(c.recordedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="font-semibold tabular-nums">{ksh(c.amount)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
