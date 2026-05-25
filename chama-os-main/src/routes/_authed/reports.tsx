import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authed/reports")({
  component: ReportsPage,
});

const reports = [
  { title: "Monthly Contribution Report", desc: "Per-member contributions for the current month, with running totals.", tag: "Monthly" },
  { title: "Savings Report", desc: "Total savings by member and growth over the last 12 months.", tag: "Savings" },
  { title: "Loans Report", desc: "All active, repaid and overdue loans with repayment progress.", tag: "Loans" },
  { title: "Member Activity Report", desc: "Attendance, participation and contribution consistency.", tag: "Members" },
  { title: "Defaulters Report", desc: "Members with missed contributions or overdue loans.", tag: "Risk" },
  { title: "Annual Summary", desc: "AGM-ready summary of the financial year.", tag: "Annual" },
];

function ReportsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Reports"
        description="Generate clear, printable reports — perfect for meetings and AGM."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <div key={r.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{r.tag}</div>
                <h3 className="text-lg font-semibold text-foreground">{r.title}</h3>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{r.desc}</p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl"><Download className="mr-2 h-4 w-4" />PDF</Button>
              <Button variant="outline" className="flex-1 rounded-xl"><Download className="mr-2 h-4 w-4" />CSV</Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" aria-label="Print"><Printer className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
