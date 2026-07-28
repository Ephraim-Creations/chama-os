import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Loader2 } from "lucide-react";
import { listPricingPlans } from "@/lib/admin.functions";
import { getChamaSubscription } from "@/lib/billing.functions";
import { useChama } from "@/context/chama-context";

export const Route = createFileRoute("/_authed/billing")({ component: Page });

type Plan = Awaited<ReturnType<typeof listPricingPlans>>[number];
type Subscription = Awaited<ReturnType<typeof getChamaSubscription>>;

function featuresOf(plan: Plan): string[] {
  const f = plan.features as unknown;
  return Array.isArray(f) ? (f.filter((x) => typeof x === "string") as string[]) : [];
}

function Page() {
  const { active } = useChama();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      listPricingPlans().catch(() => [] as Plan[]),
      active?.id
        ? getChamaSubscription({ data: { chamaId: active.id } }).catch(() => null)
        : Promise.resolve(null),
    ]).then(([p, s]) => {
      if (cancelled) return;
      setPlans((p as Plan[]).filter((x) => x.published));
      setSub(s as Subscription);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [active?.id]);

  const currentSlug = sub?.plan ?? "free";
  const renews = sub?.renews_at
    ? new Date(sub.renews_at).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Billing & subscription"
        description="Only the chairperson can manage chama billing. Plans below are the live Chama-OS pricing."
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading plans…
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          No plans are published yet. Please check back shortly.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const current = p.slug === currentSlug;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm ${
                  current
                    ? "border-primary ring-2 ring-primary/25"
                    : p.highlight
                      ? "border-primary/40"
                      : "border-border"
                }`}
              >
                {current ? (
                  <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">
                    Current plan
                  </Badge>
                ) : p.highlight ? (
                  <Badge variant="secondary" className="absolute -top-3 left-6">
                    <Sparkles className="mr-1 h-3 w-3" /> Most chosen
                  </Badge>
                ) : null}

                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 shrink-0 text-primary" />
                  <div className="truncate text-lg font-bold text-foreground">{p.name}</div>
                </div>
                <div className="mt-3 text-3xl font-bold text-foreground">{p.price_label}</div>
                <div className="text-xs text-muted-foreground">per {p.period}</div>
                {p.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                )}

                <ul className="mt-5 flex-1 space-y-2">
                  {featuresOf(p).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>

                {current ? (
                  <Button disabled className="mt-6 h-11 w-full rounded-xl font-semibold">
                    Current plan
                  </Button>
                ) : (
                  <Button asChild className="mt-6 h-11 w-full rounded-xl font-semibold">
                    <Link to="/contact">Talk to us to upgrade</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-lg font-semibold text-foreground">Your subscription</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Status: <span className="font-medium text-foreground">{sub?.status ?? "active"}</span>
          {" · "}
          {renews ? `Renews on ${renews}` : "No renewal date set — your plan does not expire."}
        </p>
        <Link
          to="/help"
          className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Have a billing question?
        </Link>
      </div>
    </div>
  );
}
