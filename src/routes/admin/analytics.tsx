import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, BarChart3, Users, MousePointerClick, Repeat } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { getWebsiteAnalytics, type AnalyticsSummary } from "@/lib/analytics.functions";

export const Route = createFileRoute("/admin/analytics")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Website analytics — Chama-OS admin" },
      { name: "description", content: "First-party visitor analytics for the Chama-OS public website." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const RANGES = [7, 30, 90] as const;

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function BreakdownList({
  rows,
}: {
  rows: Array<{ label: string; views: number; percent: number }>;
}) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map((row) => (
        <div key={row.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium capitalize text-foreground">{row.label}</span>
            <span className="text-muted-foreground">
              {row.views} · {row.percent}%
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleTable({
  head,
  rows,
}: {
  head: [string, string];
  rows: Array<{ label: string; views: number }>;
}) {
  return (
    <table className="mt-4 w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <th className="pb-2 font-medium">{head[0]}</th>
          <th className="pb-2 text-right font-medium">{head[1]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-t border-border">
            <td className="py-2 text-foreground">{row.label}</td>
            <td className="py-2 text-right font-medium text-foreground">{row.views}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Page() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    void getWebsiteAnalytics({ data: { rangeDays } })
      .then((d) => !cancelled && setData(d as AnalyticsSummary))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : "Could not load analytics."));
    return () => {
      cancelled = true;
    };
  }, [rangeDays]);

  const hasData = Boolean(data && data.totals.views > 0);

  return (
    <div>
      <PageHeader
        title="Website analytics"
        description="First-party traffic for the public website only. Signed-in chama activity is never tracked."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={rangeDays === r ? "default" : "outline"}
            onClick={() => setRangeDays(r)}
            className="h-9 rounded-lg"
          >
            {r} days
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!data && !error && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total views", value: data.totals.views, icon: BarChart3 },
              { label: "Unique visitors", value: data.totals.uniqueVisitors, icon: Users },
              { label: "Sessions", value: data.totals.sessions, icon: MousePointerClick },
              { label: "Views / session", value: data.totals.viewsPerSession, icon: Repeat },
            ].map((kpi) => (
              <Card key={kpi.label}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-3 text-2xl font-bold text-foreground">{kpi.value}</div>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Unique visitors and sessions count only visitors who accepted analytics cookies. Visitors
            who declined are recorded as anonymous page views with no identifier.
          </p>

          <Card>
            <SectionTitle>Visits over time</SectionTitle>
            {hasData ? (
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v: string) => v.slice(5)}
                      minTickGap={20}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "0.8rem",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={BarChart3}
                title="No visitor data yet"
                description="Analytics will appear here as visitors use the public website."
              />
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <SectionTitle>Top pages</SectionTitle>
              {data.topPages.length ? (
                <SimpleTable
                  head={["Page", "Views"]}
                  rows={data.topPages.map((p) => ({ label: p.path, views: p.views }))}
                />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No page views recorded yet.</p>
              )}
            </Card>

            <Card>
              <SectionTitle>Devices</SectionTitle>
              {data.devices.length ? (
                <BreakdownList rows={data.devices} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No device data yet.</p>
              )}
            </Card>

            <Card>
              <SectionTitle>Browsers</SectionTitle>
              {data.browsers.length ? (
                <BreakdownList rows={data.browsers} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No browser data yet.</p>
              )}
            </Card>

            <Card>
              <SectionTitle>Top referrers</SectionTitle>
              {data.referrers.length ? (
                <SimpleTable head={["Referrer", "Views"]} rows={data.referrers} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No referrer data yet.</p>
              )}
            </Card>

            <Card>
              <SectionTitle>Top countries</SectionTitle>
              {data.countries.length ? (
                <SimpleTable head={["Country", "Views"]} rows={data.countries} />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No country data yet.</p>
              )}
            </Card>

            <Card>
              <SectionTitle>Consent split</SectionTitle>
              <p className="mt-2 text-xs text-muted-foreground">
                Share of page views in this period recorded with, and without, analytics consent.
              </p>
              {data.totals.views ? (
                <BreakdownList
                  rows={[
                    {
                      label: "Accepted analytics",
                      views: data.consent.accepted,
                      percent: data.consent.acceptedPercent,
                    },
                    {
                      label: "Rejected analytics",
                      views: data.consent.rejected,
                      percent: data.consent.rejectedPercent,
                    },
                  ]}
                />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">No consent decisions recorded yet.</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
