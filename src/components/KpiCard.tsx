import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function KpiCard({
  label,
  value,
  trend,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string;
  trend?: number;
  icon: LucideIcon;
  accent?: "primary" | "info" | "warning" | "destructive" | "navy";
}) {
  const accentBg = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
    navy: "bg-navy/10 text-navy",
  }[accent];

  const up = (trend ?? 0) >= 0;

  return (
    <div className="group rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_16px_-4px_rgba(15,23,42,0.06)] transition hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_12px_28px_-8px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl", accentBg)}>
          <Icon className="h-5 w-5" />
        </div>
        {typeof trend === "number" && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-5 text-sm font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-foreground">
        {value}
      </div>
    </div>
  );
}
