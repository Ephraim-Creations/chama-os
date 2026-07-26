import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Building2, ShieldOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  listAdminChamas,
  listPricingPlans,
  setChamaPlan,
  setChamaStatus,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/chamas")({ component: Page });

type Chama = Awaited<ReturnType<typeof listAdminChamas>>[number];
type Plan = Awaited<ReturnType<typeof listPricingPlans>>[number];

function Page() {
  const [rows, setRows] = useState<Chama[] | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    void listAdminChamas()
      .then((d) => setRows(d as Chama[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load groups."));
  }, []);

  useEffect(() => {
    load();
    void listPricingPlans()
      .then((p) => setPlans(p as Plan[]))
      .catch(() => setPlans([]));
  }, [load]);

  async function changePlan(c: Chama, plan: string) {
    setBusy(c.id);
    try {
      await setChamaPlan({
        data: {
          chamaId: c.id,
          plan,
          status: c.billing_status === "none" ? "active" : c.billing_status,
          renewsAt: c.renews_at,
        },
      });
      toast.success(`${c.name} moved to ${plan}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the plan.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleStatus(c: Chama) {
    const next = c.status === "suspended" ? "active" : "suspended";
    setBusy(c.id);
    try {
      await setChamaStatus({ data: { chamaId: c.id, status: next } });
      toast.success(next === "suspended" ? `${c.name} suspended` : `${c.name} reactivated`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the group.");
    } finally {
      setBusy(null);
    }
  }

  const filtered = (rows ?? []).filter((c) => {
    const matchesText = `${c.name} ${c.location ?? ""} ${c.type}`
      .toLowerCase()
      .includes(q.trim().toLowerCase());
    const matchesPlan = planFilter === "all" || c.plan === planFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "suspended" ? c.status === "suspended" : c.status !== "suspended");
    return matchesText && matchesPlan && matchesStatus;
  });

  const planOptions = Array.from(new Set(["free", ...plans.map((p) => p.slug)]));

  return (
    <div>
      <PageHeader
        title="Groups"
        description="Every chama on the platform, managed as one account. Member records stay inside each group."
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by group name, type or location"
          className="h-11 max-w-sm rounded-xl"
        />
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="h-11 w-40 rounded-xl">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {planOptions.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-40 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {rows === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-3 h-6 w-6" />
          No groups match this search yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-foreground">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.type}
                    {c.location ? ` · ${c.location}` : ""} · since{" "}
                    {new Date(c.created_at).toLocaleDateString("en-KE")}
                  </div>
                </div>
                <Badge
                  variant={c.status === "suspended" ? "destructive" : "secondary"}
                  className="capitalize"
                >
                  {c.status}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <Stat label="Members" value={String(c.members)} />
                <Stat label="Billing" value={c.billing_status} />
                <Stat
                  label="Renews"
                  value={c.renews_at ? new Date(c.renews_at).toLocaleDateString("en-KE") : "—"}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Select
                  value={c.plan}
                  onValueChange={(v) => changePlan(c, v)}
                  disabled={busy === c.id}
                >
                  <SelectTrigger className="h-10 w-44 rounded-lg capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {planOptions.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={c.status === "suspended" ? "default" : "outline"}
                  disabled={busy === c.id}
                  onClick={() => toggleStatus(c)}
                  className="h-10 rounded-lg font-semibold"
                >
                  {c.status === "suspended" ? (
                    <>
                      <ShieldCheck className="mr-1.5 h-4 w-4" /> Reactivate
                    </>
                  ) : (
                    <>
                      <ShieldOff className="mr-1.5 h-4 w-4" /> Suspend
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold capitalize text-foreground">{value}</div>
    </div>
  );
}
