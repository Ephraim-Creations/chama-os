import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Users, Inbox, Tags, Wallet, HandCoins, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getPlatformOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/")({ component: Page });

type Overview = Awaited<ReturnType<typeof getPlatformOverview>>;

const ksh = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;

function Page() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getPlatformOverview()
      .then((d) => setData(d as Overview))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load stats."));
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cards = [
    { label: "Chamas", value: String(data.chamas), icon: Building2, to: "/admin/chamas" },
    { label: "Members", value: String(data.members), icon: Users, to: "/admin/chamas" },
    { label: "Pending applications", value: String(data.pendingApplications), icon: Inbox, to: "/admin/applications" },
    { label: "Pricing plans", value: String(data.plans), icon: Tags, to: "/admin/pricing" },
    { label: "Contributions tracked", value: ksh(data.contributionsTotal), icon: Wallet },
    { label: "Loans issued", value: ksh(data.loansTotal), icon: HandCoins },
  ];

  return (
    <div>
      <PageHeader
        title="Platform overview"
        description="Everything happening across Chama-OS: groups, people, money and demand."
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
    </div>
  );
}
