import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Pencil, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ksh } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useChama } from "@/context/chama-context";

export const Route = createFileRoute("/_authed/transparency")({ component: Page });

type Log = {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  previous_value: unknown;
  new_value: unknown;
  reason: string | null;
  created_at: string;
  edited_by: string;
  editorName: string;
};

const FILTERS = [
  { key: "all", label: "All", tables: [] as string[] },
  { key: "contributions", label: "Contributions", tables: ["contributions"] },
  { key: "deductions", label: "Deductions", tables: ["deductions", "deduction_members"] },
  { key: "loans", label: "Loans", tables: ["loans", "loan_repayments"] },
  { key: "investments", label: "Investments", tables: ["investments"] },
];

const AREA_LABEL: Record<string, string> = {
  contributions: "Contribution",
  deductions: "Deduction",
  deduction_members: "Deduction",
  loans: "Loan",
  loan_repayments: "Loan payment",
  investments: "Investment",
};

const ACTION_VERB: Record<string, string> = {
  create: "recorded",
  update: "updated",
  delete: "removed",
};

function field(value: unknown, key: string) {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function money(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? ksh(n) : null;
}

/** One plain-English sentence describing the change. */
function describe(log: Log) {
  const source = log.new_value ?? log.previous_value;
  const area = AREA_LABEL[log.table_name] ?? log.table_name;
  const verb = ACTION_VERB[log.action] ?? log.action;
  const bits: string[] = [];

  const amount =
    money(field(source, "amount")) ?? money(field(source, "amount_per_member"));
  if (amount) bits.push(amount);

  const type = field(source, "type") ?? field(source, "status") ?? field(source, "name");
  if (typeof type === "string" && type.length) bits.push(String(type).replace(/_/g, " "));

  return `${log.editorName} ${verb} a ${area.toLowerCase()}${bits.length ? ` — ${bits.join(" · ")}` : ""}`;
}

function summarise(value: unknown) {
  if (value == null) return null;
  if (typeof value === "string") return value;
  try {
    return Object.entries(value as Record<string, unknown>)
      .slice(0, 4)
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(" · ");
  } catch {
    return null;
  }
}

function Page() {
  const { active } = useChama();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!active) {
        setLogs([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from("transparency_logs")
        .select("id, table_name, record_id, action, previous_value, new_value, reason, created_at, edited_by")
        .eq("chama_id", active.id)
        .order("created_at", { ascending: false })
        .limit(60);

      const rows = data ?? [];
      const ids = Array.from(new Set(rows.map((r) => r.edited_by)));
      const names = new Map<string, string>();
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, display_name")
          .in("id", ids);
        (profs ?? []).forEach((p: any) => names.set(p.id, p.display_name || p.full_name || "Member"));
      }
      if (cancelled) return;
      setLogs(rows.map((r) => ({ ...r, editorName: names.get(r.edited_by) ?? "Member" })));
      setLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visible =
    activeFilter.tables.length === 0
      ? logs
      : logs.filter((l) => activeFilter.tables.includes(l.table_name));

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Activity log"
        description="Every change to a financial record is logged here. Open to all members."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={filter === f.key ? "default" : "outline"}
            className="h-9 rounded-full"
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-14">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState
            icon={ShieldCheck}
            title="No changes recorded yet"
            description="Whenever a record is created or edited, it will appear here for everyone to see."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((l) => {
            const prev = summarise(l.previous_value);
            const next = summarise(l.new_value);
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        l.action === "create"
                          ? "bg-info/10 text-info hover:bg-info/10"
                          : l.action === "delete"
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/10"
                          : "bg-warning/15 text-warning hover:bg-warning/15"
                      }
                    >
                      <Pencil className="mr-1 h-3 w-3" />{" "}
                      {l.action === "create" ? "Created" : l.action === "delete" ? "Removed" : "Edited"}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      {AREA_LABEL[l.table_name] ?? l.table_name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-3 text-[15px] text-foreground">{describe(l)}</div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {prev && (
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="text-xs text-muted-foreground">Previous</div>
                      <div className="mt-1 break-words font-mono text-sm text-foreground">{prev}</div>
                    </div>
                  )}
                  {next && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="text-xs text-primary">New</div>
                      <div className="mt-1 break-words font-mono text-sm text-foreground">{next}</div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  By <span className="font-semibold text-foreground">{l.editorName}</span>
                  {l.reason && <> · <span className="italic">"{l.reason}"</span></>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
