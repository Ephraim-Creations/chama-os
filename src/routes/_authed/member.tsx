import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, HandCoins, TrendingUp, CalendarDays, Plus } from "lucide-react";
import { ksh } from "@/lib/mock-data";

export const Route = createFileRoute("/_authed/member")({ component: Page });

function Page() {
  const personalSavings = 185_000;
  const eligibleLoan = personalSavings * 3;
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="My chama"
        description="Your personal contributions, loans and meetings at a glance."
        actions={<Button className="h-11 rounded-xl font-semibold"><Plus className="mr-2 h-4 w-4" /> Apply for loan</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="My savings" value={ksh(personalSavings)} trend={6.2} icon={Wallet} accent="primary" />
        <KpiCard label="Loan eligibility" value={ksh(eligibleLoan)} trend={0} icon={HandCoins} accent="info" />
        <KpiCard label="Active loan" value={ksh(45_000)} trend={-12.5} icon={TrendingUp} accent="warning" />
        <KpiCard label="Attendance" value="96%" trend={2} icon={CalendarDays} accent="navy" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-lg font-semibold text-foreground">Loan repayment</div>
          <p className="text-sm text-muted-foreground">Ksh 35,000 of Ksh 80,000 repaid</p>
          <Progress value={43} className="mt-4 h-2" />
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Next due</span>
            <span className="font-semibold text-foreground">15 Jun 2026 · Ksh 10,000</span>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-lg font-semibold text-foreground">Next meeting</div>
          <p className="text-sm text-muted-foreground">Monthly members meeting</p>
          <div className="mt-4 text-base font-semibold text-foreground">28 May 2026 · 7:00 PM</div>
          <div className="text-sm text-muted-foreground">KCB Hall, Nairobi</div>
          <Button variant="outline" className="mt-4 h-10 rounded-xl">Confirm attendance</Button>
        </div>
      </div>
    </div>
  );
}
