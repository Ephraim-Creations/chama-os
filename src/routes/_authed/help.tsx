import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Mail, Phone, ShieldCheck, Loader2, LifeBuoy } from "lucide-react";
import { usePermissions } from "@/hooks/use-permissions";
import { useChama } from "@/context/chama-context";
import { submitTicket, listMyTicketsFn, CATEGORIES } from "@/lib/support.functions";
import { ROLE_LABELS, type Role } from "@/lib/permissions";

export const Route = createFileRoute("/_authed/help")({
  component: HelpPage,
});

const SUPPORT_EMAIL = "info@ephraimcreations.co.ke";
const SUPPORT_PHONE = "+254 112 268 873";

type Faq = { q: string; a: string; roles: Role[] };

const FAQS: Faq[] = [
  {
    q: "Who can add members and assign roles?",
    a: "Only the Chairperson. From Members → Invite member, the chairperson enters the member's email and picks their role (Treasurer, Secretary or Member). The invited person gets a sign-in link by email and joins automatically the first time they sign in.",
    roles: ["chairperson", "treasurer", "secretary", "member"],
  },
  {
    q: "Who records contributions and repayments?",
    a: "The Treasurer (and the Chairperson) can add or edit contribution and loan repayment records. Everyone else can view them. Every edit is stamped with who changed it and when in the Activity log.",
    roles: ["treasurer", "chairperson"],
  },
  {
    q: "Who approves loans?",
    a: "The Treasurer reviews and prepares a loan; the Chairperson gives the final approval. Members apply from the Loans page and can track their status there.",
    roles: ["chairperson", "treasurer", "member"],
  },
  {
    q: "Who schedules meetings and files minutes?",
    a: "The Secretary schedules meetings, marks attendance and writes minutes from the Minutes desk. The Chairperson can do the same. Members see the calendar and read published minutes.",
    roles: ["secretary", "chairperson"],
  },
  {
    q: "Who changes the chama rules and settings?",
    a: "Only the Chairperson. Settings → Chama setup holds contribution amount and frequency, meeting cadence, quorum percentage, loan-approval threshold, penalties and joining fees. Changes apply to everyone immediately.",
    roles: ["chairperson"],
  },
  {
    q: "Who manages billing?",
    a: "Only the Chairperson can see and change the chama's plan on the Billing page. Members are never charged individually.",
    roles: ["chairperson"],
  },
  {
    q: "How do I change my own profile, password or PIN?",
    a: "Go to Settings → Profile to update your name and avatar, and Settings → Security to reset your password or set a new 4-digit PIN. You can only change your own credentials — never another member's.",
    roles: ["chairperson", "treasurer", "secretary", "member"],
  },
  {
    q: "Why can't I see some pages in the sidebar?",
    a: "The sidebar only shows what your role is allowed to do. If you need access to something, ask your chairperson to change your role from the Members page.",
    roles: ["treasurer", "secretary", "member"],
  },
  {
    q: "Does Chama-OS hold our money?",
    a: "No. Chama-OS is a record-keeping platform only. We never receive, hold or move any money — contributions and loans stay in your own group's account.",
    roles: ["chairperson", "treasurer", "secretary", "member"],
  },
  {
    q: "Can we export our records?",
    a: "Yes. Every report on the Reports page can be exported for your AGM or audit.",
    roles: ["chairperson", "treasurer", "secretary", "member"],
  },
];

function HelpPage() {
  const { role } = usePermissions();
  const [query, setQuery] = useState("");

  const ordered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? FAQS.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q))
      : FAQS;
    if (!role) return filtered;
    return [...filtered].sort(
      (a, b) => Number(b.roles.includes(role)) - Number(a.roles.includes(role)),
    );
  }, [query, role]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Help center"
        description={
          role
            ? `Answers tailored to what a ${ROLE_LABELS[role]} can do in Chama-OS.`
            : "Answers about roles, records and support."
        }
      />

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for help…"
            className="h-14 rounded-xl pl-12 text-base"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:bg-muted/40"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground">Email support</div>
              <div className="truncate text-sm text-muted-foreground">{SUPPORT_EMAIL}</div>
            </div>
          </a>
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
            className="flex items-start gap-3 rounded-xl border border-border p-4 transition hover:bg-muted/40"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground">Call the admin</div>
              <div className="truncate text-sm text-muted-foreground">{SUPPORT_PHONE}</div>
            </div>
          </a>
          <div className="flex items-start gap-3 rounded-xl border border-border p-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-foreground">Records only</div>
              <div className="text-sm text-muted-foreground">We never hold your money</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Frequently asked questions</h2>
      {ordered.length === 0 ? (
        <p className="mt-3 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
          No answers matched “{query}”. Email {SUPPORT_EMAIL} and we'll help.
        </p>
      ) : (
        <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
          {ordered.map((f) => (
            <details key={f.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-[15px] font-semibold text-foreground">
                <span className="min-w-0 flex-1">{f.q}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {role && f.roles.includes(role) && (
                    <Badge variant="secondary" className="text-[10px]">
                      For you
                    </Badge>
                  )}
                  <span className="text-2xl text-muted-foreground transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
