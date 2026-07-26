import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
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
import { listAdminChamas, listPricingPlans, setChamaPlan } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/billing")({ component: Page });

type Chama = Awaited<ReturnType<typeof listAdminChamas>>[number];
type Plan = Awaited<ReturnType<typeof listPricingPlans>>[number];

const statuses = ["active", "trialing", "past_due", "cancelled"] as const;

function Page() {
  const [rows, setRows] = useState<Chama[] | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [draft, setDraft] = useState<Record<string, { status: string; renewsAt: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    void listAdminChamas()
      .then((d) => setRows(d as Chama[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load billing."));
  }, []);

  useEffect(() => {
    load();
    void listPricingPlans()
      .then((p) => setPlans(p as Plan[]))
      .catch(() => setPlans([]));
  }, [load]);

  const planOptions = Array.from(new Set(["free", ...plans.map((p) => p.slug)]));

  function fieldFor(c: Chama) {
    return (
      draft[c.id] ?? {
        status: c.billing_status === "none" ? "active" : c.billing_status,
        renewsAt: c.renews_at ? c.renews_at.slice(0, 10) : "",
      }
    );
  }

  async function save(c: Chama, plan: string) {
    const f = fieldFor(c);
    setBusy(c.id);
    try {
      await setChamaPlan({
        data: {
          chamaId: c.id,
          plan,
          status: f.status as (typeof statuses)[number],
          renewsAt: f.renewsAt ? new Date(f.renewsAt).toISOString() : null,
        },
      });
      toast.success(`Subscription updated for ${c.name}`);
      setDraft((d) => {
        const next = { ...d };
        delete next[c.id];
        return next;
      });
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the subscription.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Plans & billing"
        description="Assign a plan to each group and track its subscription. Groups only — no member billing data here."
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {rows === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <CreditCard className="mx-auto mb-3 h-6 w-6" />
          No groups to bill yet.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => {
            const f = fieldFor(c);
            return (
              <div
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-foreground">{c.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="capitalize">
                      {c.plan}
                    </Badge>
                    <span className="capitalize">{c.billing_status}</span>
                    <span>
                      {c.renews_at
                        ? `renews ${new Date(c.renews_at).toLocaleDateString("en-KE")}`
                        : "no renewal date"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-2">
                  <Field label="Plan">
                    <Select
                      value={c.plan}
                      onValueChange={(v) => save(c, v)}
                      disabled={busy === c.id}
                    >
                      <SelectTrigger className="h-10 w-36 rounded-lg capitalize">
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
                  </Field>

                  <Field label="Status">
                    <Select
                      value={f.status}
                      onValueChange={(v) =>
                        setDraft((d) => ({ ...d, [c.id]: { ...f, status: v } }))
                      }
                    >
                      <SelectTrigger className="h-10 w-36 rounded-lg capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Renews on">
                    <Input
                      type="date"
                      value={f.renewsAt}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [c.id]: { ...f, renewsAt: e.target.value } }))
                      }
                      className="h-10 w-40 rounded-lg"
                    />
                  </Field>

                  <Button
                    size="sm"
                    disabled={busy === c.id}
                    onClick={() => save(c, c.plan)}
                    className="h-10 rounded-lg font-semibold"
                  >
                    {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
