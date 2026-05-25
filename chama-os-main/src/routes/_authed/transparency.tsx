import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Pencil } from "lucide-react";

export const Route = createFileRoute("/_authed/transparency")({ component: Page });

const logs = [
  { id: 1, table: "contributions", record: "C1024", action: "update", by: "Wanjiku Kamau (Treasurer)", time: "25 May 2026 · 12:14", reason: "Corrected amount after bank slip review", prev: "Ksh 4,500", next: "Ksh 5,000" },
  { id: 2, table: "loans", record: "L0042", action: "update", by: "Wanjiku Kamau (Treasurer)", time: "24 May 2026 · 09:02", reason: "Recorded repayment of Ksh 10,000", prev: "Repaid 25,000", next: "Repaid 35,000" },
  { id: 3, table: "investments", record: "INV-002", action: "update", by: "Otieno Ochieng (Chair)", time: "20 May 2026 · 18:30", reason: "Quarterly valuation update", prev: "Ksh 1,150,000", next: "Ksh 1,200,000" },
  { id: 4, table: "contributions", record: "C1019", action: "create", by: "Wanjiku Kamau (Treasurer)", time: "18 May 2026 · 11:00", reason: null, prev: null, next: "Ksh 5,000 — Savings" },
];

function Page() {
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Transparency log"
        description="Every change to a financial record is logged here. Open to all members."
        actions={<Button variant="outline" className="h-11 rounded-xl"><ShieldCheck className="mr-2 h-4 w-4" /> Export audit</Button>}
      />
      <div className="space-y-3">
        {logs.map((l) => (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge className={l.action === "create" ? "bg-info/10 text-info hover:bg-info/10" : "bg-warning/15 text-warning hover:bg-warning/15"}>
                  <Pencil className="mr-1 h-3 w-3" /> {l.action === "create" ? "Created" : "Edited"}
                </Badge>
                <span className="font-mono text-sm text-foreground">{l.table} · {l.record}</span>
              </div>
              <div className="text-xs text-muted-foreground">{l.time}</div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {l.prev != null && (
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs text-muted-foreground">Previous</div>
                  <div className="mt-1 font-mono text-sm text-foreground">{l.prev}</div>
                </div>
              )}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                <div className="text-xs text-primary">New</div>
                <div className="mt-1 font-mono text-sm text-foreground">{l.next}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              By <span className="font-semibold text-foreground">{l.by}</span>
              {l.reason && <> · <span className="italic">"{l.reason}"</span></>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
