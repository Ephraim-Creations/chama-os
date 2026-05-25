import { createFileRoute } from "@tanstack/react-router";
import { Plus, HandCoins, AlertTriangle, CheckCircle2, Percent } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { loans, ksh } from "@/lib/mock-data";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authed/loans")({
  component: LoansPage,
});

const statusColor: Record<string, string> = {
  Active: "bg-info/10 text-info hover:bg-info/10",
  Overdue: "bg-destructive/10 text-destructive hover:bg-destructive/10",
  Repaid: "bg-success/10 text-success hover:bg-success/10",
};

function LoansPage() {
  const totalOut = loans.reduce((a, l) => a + (l.amount - l.paid), 0);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Loans"
        description="Records only — Chama-OS does not disburse or hold any money."
        actions={<Button className="h-11 rounded-xl font-semibold"><Plus className="mr-2 h-4 w-4" />Record loan</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active loans" value="7" trend={-3} icon={HandCoins} accent="warning" />
        <KpiCard label="Outstanding" value={ksh(totalOut)} trend={-8} icon={Percent} accent="primary" />
        <KpiCard label="Overdue" value="1" trend={0} icon={AlertTriangle} accent="destructive" />
        <KpiCard label="Repayment rate" value="94%" trend={2.7} icon={CheckCircle2} accent="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-3 rounded-xl bg-info/5 p-4 text-sm">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <div className="text-foreground">
            <span className="font-semibold">Loan qualification:</span> A member qualifies for a loan up to{" "}
            <span className="font-semibold">3× their savings</span> after 6 months of consistent contributions and no active overdue loans.
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Loan ID</TableHead>
                <TableHead>Borrower</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead className="min-w-[180px]">Repayment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.map((l) => {
                const pct = Math.round((l.paid / l.amount) * 100);
                return (
                  <TableRow key={l.id} className="text-[15px]">
                    <TableCell className="font-mono text-sm text-muted-foreground">{l.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{l.initials}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-foreground">{l.borrower}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{ksh(l.amount)}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.interest}%</TableCell>
                    <TableCell className="text-muted-foreground">{l.due}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={pct} className="h-2" />
                        <span className="w-10 text-right text-sm font-semibold tabular-nums">{pct}%</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {ksh(l.paid)} of {ksh(l.amount)}
                      </div>
                    </TableCell>
                    <TableCell><Badge className={statusColor[l.status]}>{l.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
