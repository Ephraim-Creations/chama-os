import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Inbox, Tags, ShieldOff, Sparkles, CircleCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getPlatformOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({ component: Page });

type Overview = Awaited<ReturnType<typeof getPlatformOverview>>;

function Page() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getPlatformOverview()
      .then((d) => setData(d as Overview))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load stats."));
  }, []);

  if (error) return <p className="text-sm text-destructive">{error}</p>;

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: "Groups", value: String(data.chamas), icon: Building2, to: "/admin/chamas" },
    { label: "Active groups", value: String(data.activeChamas), icon: CircleCheck },
    { label: "Suspended", value: String(data.suspendedChamas), icon: ShieldOff },
    { label: "New this month", value: String(data.newThisMonth), icon: Sparkles },
    {
      label: "Pending applications",
      value: String(data.pendingApplications),
      icon: Inbox,
      to: "/admin/applications",
    },
    { label: "Pricing plans", value: String(data.plans), icon: Tags, to: "/admin/pricing" },
  ];

  return (
    <div>
      <PageHeader
        title="Platform overview"
        description="Chama-OS at a glance. Groups are managed as single accounts — member records stay private to each chama."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">{c.value}</div>
            </div>
          );
          return c.to ? (
            <Link key={c.label} to={c.to}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Plan mix
        </h2>
        {data.planMix.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No groups yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.planMix.map((p) => {
              const pct = Math.round((p.groups / Math.max(1, data.chamas)) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize text-foreground">{p.plan}</span>
                    <span className="text-muted-foreground">
                      {p.groups} {p.groups === 1 ? "group" : "groups"} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
