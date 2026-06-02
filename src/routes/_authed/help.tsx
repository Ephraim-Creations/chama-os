import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, BookOpen, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authed/help")({
  component: HelpPage,
});

const faqs = [
  { q: "How do I add a new member?", a: "Go to Members → Add member, fill in their phone number and role, then send them the invite code." },
  { q: "Does Chama-OS hold our money?", a: "No. Chama-OS is purely a digital record-keeping platform. We never receive or hold any money." },
  { q: "Who can edit contribution records?", a: "Only the Treasurer and Chairperson roles can add or edit contribution records. All members can view them." },
  { q: "How do members qualify for loans?", a: "By default a member qualifies for up to 3× their savings after 6 consistent months and no overdue loans. You can change this in Chama settings." },
  { q: "Can I export records?", a: "Yes — every report can be exported as PDF or CSV from the Reports page." },
];

function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Help Center" description="Quick answers and friendly support." />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search for help…" className="h-14 rounded-xl pl-12 text-base" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: BookOpen, t: "Guides", d: "Step-by-step walkthroughs" },
            { icon: MessageCircle, t: "Chat support", d: "Reply within 24 hours" },
            { icon: ShieldCheck, t: "Trust & safety", d: "How your data is protected" },
          ].map((c) => (
            <div key={c.t} className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:bg-muted/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{c.t}</div>
                <div className="text-sm text-muted-foreground">{c.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Frequently asked questions</h2>
      <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
        {faqs.map((f) => (
          <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between text-[15px] font-semibold text-foreground">
              {f.q}
              <span className="text-2xl text-muted-foreground transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
