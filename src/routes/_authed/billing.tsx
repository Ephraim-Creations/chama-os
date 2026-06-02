import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authed/billing")({ component: Page });

const plans = [
  { name: "Free", price: "Ksh 0", features: ["Up to 15 members", "Basic dashboard", "Transparency logs"], current: false },
  { name: "Growth", price: "Ksh 1,500/mo", features: ["Up to 50 members", "Investments + Feed", "WhatsApp reminders", "Priority support"], current: true, popular: true },
  { name: "SACCO", price: "Ksh 4,500/mo", features: ["Unlimited members", "Custom reports", "Multi-chama linking", "Dedicated success manager"], current: false },
];

function Page() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Billing & subscription" description="Only the chairperson can manage chama billing." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.name} className={`relative rounded-2xl border bg-card p-6 shadow-sm ${p.popular ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
            {p.popular && <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground"><Sparkles className="mr-1 h-3 w-3" /> Most chosen</Badge>}
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <div className="text-lg font-bold text-foreground">{p.name}</div>
            </div>
            <div className="mt-3 text-3xl font-bold text-foreground">{p.price}</div>
            <ul className="mt-5 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground"><Check className="mt-0.5 h-4 w-4 text-success" /> {f}</li>
              ))}
            </ul>
            <Button disabled={p.current} className="mt-6 h-11 w-full rounded-xl font-semibold">
              {p.current ? "Current plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="text-lg font-semibold text-foreground">Payment history</div>
        <p className="mt-1 text-sm text-muted-foreground">No invoices yet — your current plan renews on 1 Jun 2026.</p>
        <Link to="/help" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Have a billing question?</Link>
      </div>
    </div>
  );
}
