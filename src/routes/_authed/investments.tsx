import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { TrendingUp, Plus, Loader2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ksh } from "@/lib/mock-data";
import { useChama } from "@/context/chama-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useSnapshot } from "@/hooks/use-snapshot";
import { addInvestment } from "@/lib/records.functions";

export const Route = createFileRoute("/_authed/investments")({ component: Page });

function Page() {
  const { active } = useChama();
  const { can } = usePermissions();
  const { snapshot, loading, refresh } = useSnapshot();
  const items = snapshot?.investments ?? [];

  const invested = items.reduce((a, i) => a + i.initialValue, 0);
  const current = items.reduce((a, i) => a + i.currentValue, 0);
  const income = items.reduce((a, i) => a + i.monthlyIncome, 0);

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Investments"
        description="Group assets, their value today and the income they bring in."
        actions={
          can("investments.manage") && active ? (
            <InvestmentDialog chamaId={active.id} onDone={refresh} />
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Amount invested" value={ksh(invested)} icon={Building2} accent="navy" />
        <KpiCard label="Current value" value={ksh(current)} icon={TrendingUp} accent="primary" />
        <KpiCard label="Monthly income" value={ksh(income)} icon={TrendingUp} accent="info" />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <EmptyState
              icon={TrendingUp}
              title="No investments recorded"
              description="Add the group's assets to track their value over time."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((i) => {
              const growth = i.initialValue
                ? Math.round(((i.currentValue - i.initialValue) / i.initialValue) * 100)
                : 0;
              return (
                <article key={i.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-foreground">{i.name}</h3>
                      {i.category && <div className="text-sm text-muted-foreground">{i.category}</div>}
                    </div>
                    <Badge
                      className={
                        growth >= 0
                          ? "bg-success/10 text-success hover:bg-success/10"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                      }
                    >
                      {growth >= 0 ? "+" : ""}{growth}%
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Invested</div>
                      <div className="font-semibold tabular-nums">{ksh(i.initialValue)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Today</div>
                      <div className="font-semibold tabular-nums">{ksh(i.currentValue)}</div>
                    </div>
                  </div>
                  <Progress value={Math.min(100, Math.max(0, growth + 50))} className="mt-4 h-2" />
                  <div className="mt-3 text-sm text-muted-foreground">
                    Monthly income: <span className="font-semibold text-foreground">{ksh(i.monthlyIncome)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InvestmentDialog({ chamaId, onDone }: { chamaId: string; onDone: () => void }) {
  const save = useServerFn(addInvestment);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [initialValue, setInitialValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("0");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.error("Give the investment a name");
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          chamaId,
          name: name.trim(),
          category: category.trim() || null,
          initialValue: Number(initialValue) || 0,
          currentValue: Number(currentValue) || Number(initialValue) || 0,
          monthlyIncome: Number(monthlyIncome) || 0,
        },
      });
      toast.success("Investment saved");
      setOpen(false);
      setName("");
      setCategory("");
      setInitialValue("");
      setCurrentValue("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Record investment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record an investment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input className="h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input className="h-11 rounded-xl" placeholder="Land, equipment, shares…" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount invested</Label>
              <Input className="h-11 rounded-xl" inputMode="numeric" value={initialValue} onChange={(e) => setInitialValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Value today</Label>
              <Input className="h-11 rounded-xl" inputMode="numeric" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Monthly income</Label>
            <Input className="h-11 rounded-xl" inputMode="numeric" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
