import { createFileRoute } from "@tanstack/react-router";
import { Plus, Download, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/KpiCard";
import { Wallet, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { recentContributions, ksh } from "@/lib/mock-data";

export const Route = createFileRoute("/_authed/contributions")({
  component: ContributionsPage,
});

function ContributionsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Contributions"
        description="Track every shilling recorded — savings, welfare, projects and penalties."
        actions={
          <>
            <Button variant="outline" className="h-11 rounded-xl"><Download className="mr-2 h-4 w-4" />Export CSV</Button>
            <Button className="h-11 rounded-xl font-semibold"><Plus className="mr-2 h-4 w-4" /> Record contribution</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="This month" value={ksh(184_500)} trend={8.2} icon={Wallet} accent="primary" />
        <KpiCard label="Welfare collected" value={ksh(33_500)} trend={4.1} icon={TrendingUp} accent="info" />
        <KpiCard label="Penalties" value={ksh(6_800)} trend={-12} icon={AlertCircle} accent="destructive" />
        <KpiCard label="Confirmed entries" value="124" trend={6} icon={CheckCircle2} accent="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by member, reference or month…" className="h-11 rounded-xl pl-10 text-[15px]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Reference</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentContributions.map((c) => (
                <TableRow key={c.id} className="text-[15px]">
                  <TableCell className="font-mono text-sm text-muted-foreground">{c.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{c.initials}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium text-foreground">{c.member}</div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="rounded-full">{c.type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{c.date}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{ksh(c.amount)}</TableCell>
                  <TableCell>
                    <Badge className={c.status === "Confirmed"
                      ? "bg-success/10 text-success hover:bg-success/10"
                      : "bg-warning/15 text-warning hover:bg-warning/15"}>{c.status}</Badge>
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
