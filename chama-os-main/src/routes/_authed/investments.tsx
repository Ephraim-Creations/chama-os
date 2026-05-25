import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Building2, Sprout, Plus } from "lucide-react";
import { ksh } from "@/lib/mock-data";

export const Route = createFileRoute("/_authed/investments")({ component: Page });

const items = [
  { id: 1, name: "Kiserian Plot (¼ acre)", category: "Real Estate", icon: Building2, initial: 850_000, current: 1_200_000, income: 0 },
  { id: 2, name: "Event Tents (20 units)", category: "Equipment", icon: Sprout, initial: 320_000, current: 380_000, income: 42_000 },
  { id: 3, name: "Dairy Project — Limuru", category: "Agriculture", icon: TrendingUp, initial: 180_000, current: 215_000, income: 18_500 },
];

function Page() {
  const total = items.reduce((s, i) => s + i.current, 0);
  const monthly = items.reduce((s, i) => s + i.income, 0);
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Investments"
        description="Track every group investment and its growth."
        actions={<Button className="h-11 rounded-xl font-semibold"><Plus className="mr-2 h-4 w-4" /> Add investment</Button>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Portfolio value" value={ksh(total)} tone="primary" />
        <Stat label="Monthly income" value={ksh(monthly)} tone="info" />
        <Stat label="Investments tracked" value={items.length.toString()} tone="navy" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => {
          const growth = ((i.current - i.initial) / i.initial) * 100;
          return (
            <div key={i.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><i.icon className="h-5 w-5" /></div>
                  <div>
                    <div className="font-semibold text-foreground">{i.name}</div>
                    <div className="text-xs text-muted-foreground">{i.category}</div>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success hover:bg-success/10">+{growth.toFixed(1)}%</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <Row label="Initial value" value={ksh(i.initial)} />
                <Row label="Current value" value={ksh(i.current)} bold />
                <Row label="Monthly income" value={ksh(i.income)} />
              </div>
              <Progress value={Math.min(100, growth + 50)} className="mt-4 h-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "info" | "navy" }) {
  const map = { primary: "text-primary", info: "text-info", navy: "text-navy" };
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${map[tone]}`}>{value}</div>
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className="flex justify-between text-sm"><span className="text-muted-foreground">{label}</span><span className={bold ? "font-bold text-foreground" : "font-medium text-foreground"}>{value}</span></div>;
}
