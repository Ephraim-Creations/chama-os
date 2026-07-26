import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { deletePricingPlan, listPricingPlans, savePricingPlan } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/pricing")({ component: Page });

type Plan = Awaited<ReturnType<typeof listPricingPlans>>[number];

type Draft = {
  id?: string;
  slug: string;
  name: string;
  price_label: string;
  amount_kes: number;
  period: string;
  description: string;
  features: string;
  highlight: boolean;
  sort_order: number;
  published: boolean;
};

const empty: Draft = {
  slug: "", name: "", price_label: "", amount_kes: 0, period: "month",
  description: "", features: "", highlight: false, sort_order: 0, published: true,
};

function toDraft(p: Plan): Draft {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price_label: p.price_label,
    amount_kes: p.amount_kes,
    period: p.period,
    description: p.description ?? "",
    features: ((p.features as string[]) ?? []).join("\n"),
    highlight: p.highlight,
    sort_order: p.sort_order,
    published: p.published,
  };
}

function Page() {
  const [rows, setRows] = useState<Plan[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setRows((await listPricingPlans()) as Plan[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      await savePricingPlan({
        data: {
          ...draft,
          amount_kes: Number(draft.amount_kes) || 0,
          sort_order: Number(draft.sort_order) || 0,
          features: draft.features.split("\n").map((f) => f.trim()).filter(Boolean),
        },
      });
      toast.success("Plan saved.");
      setDraft(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await deletePricingPlan({ data: { id } });
      toast.success("Plan deleted.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Pricing"
        description="These plans power the public pricing section on the website."
        action={
          <Button onClick={() => setDraft(empty)} className="h-11 rounded-xl font-semibold">
            <Plus className="mr-2 h-4 w-4" /> New plan
          </Button>
        }
      />

      {rows === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {rows.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl border bg-card p-6 shadow-sm ${p.highlight ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">/{p.slug}</div>
                </div>
                <div className="flex gap-1">
                  {p.highlight && <Star className="h-4 w-4 text-primary" />}
                  {!p.published && <Badge variant="secondary">Hidden</Badge>}
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">
                {p.price_label}
                <span className="text-sm font-normal text-muted-foreground">/{p.period}</span>
              </div>
              {p.description && <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>}
              <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                {((p.features as string[]) ?? []).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setDraft(toDraft(p))}>
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit
                </Button>
                <Button size="sm" variant="ghost" className="rounded-lg text-destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit plan" : "New plan"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-4">
              <Field label="Name">
                <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </Field>
              <Field label="Slug">
                <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Price label">
                  <Input value={draft.price_label} onChange={(e) => setDraft({ ...draft, price_label: e.target.value })} />
                </Field>
                <Field label="Amount (KSh)">
                  <Input
                    type="number"
                    value={draft.amount_kes}
                    onChange={(e) => setDraft({ ...draft, amount_kes: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Period">
                  <Input value={draft.period} onChange={(e) => setDraft({ ...draft, period: e.target.value })} />
                </Field>
                <Field label="Sort order">
                  <Input
                    type="number"
                    value={draft.sort_order}
                    onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                  />
                </Field>
              </div>
              <Field label="Description">
                <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </Field>
              <Field label="Features (one per line)">
                <Textarea
                  rows={5}
                  value={draft.features}
                  onChange={(e) => setDraft({ ...draft, features: e.target.value })}
                />
              </Field>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label htmlFor="highlight">Highlight as most popular</Label>
                <Switch
                  id="highlight"
                  checked={draft.highlight}
                  onCheckedChange={(v) => setDraft({ ...draft, highlight: v })}
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label htmlFor="published">Show on the website</Label>
                <Switch
                  id="published"
                  checked={draft.published}
                  onCheckedChange={(v) => setDraft({ ...draft, published: v })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="rounded-xl font-semibold">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
