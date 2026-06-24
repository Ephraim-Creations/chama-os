import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Sprout, Loader2, LogIn, Users, Sparkles, Lock,
  Check, ChevronRight, Plus, Trash2, Copy, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createChama, findSimilarChamas } from "@/lib/chama.functions";
import { useChama } from "@/context/chama-context";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app/create")({
  component: CreateChamaPage,
  head: () => ({ meta: [{ title: "Create chama — Chama-OS" }] }),
});

const TYPES = [
  ["investment", "Investment group"], ["welfare", "Welfare group"], ["sacco", "Sacco"],
  ["table_banking", "Table banking"], ["women", "Women's group"], ["men", "Men's group"],
  ["youth", "Youth group"], ["church", "Church group"], ["community", "Community group"],
] as const;

const FREQ = [
  ["weekly", "Weekly"], ["biweekly", "Every 2 weeks"],
  ["monthly", "Monthly"], ["quarterly", "Quarterly"],
] as const;

type Suggestion = { id: string; name: string; type: string; location: string | null };
type Role = "member" | "treasurer" | "secretary" | "chairperson";
type InviteRow = { email: string; role: Role };
type SeededInvite = { email: string; role: string; token: string };

const STEPS = ["Basics", "Rules", "Members", "Review"] as const;

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function CreateChamaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chamas, refresh, setActiveId } = useChama();

  // Any signed-in user can create a chama and becomes its chairperson.

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // Step 1: Basics
  const [basics, setBasics] = useState({
    name: "",
    type: "investment",
    location: "",
    description: "",
    founded_year: "" as string,
  });
  const [publicMatches, setPublicMatches] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);

  // Step 2: Rules
  const [rules, setRules] = useState({
    currency: "KES",
    contribution_amount: 1000,
    contribution_frequency: "monthly" as "weekly" | "biweekly" | "monthly" | "quarterly",
    late_penalty: 100,
    meeting_cadence: "monthly" as "weekly" | "biweekly" | "monthly" | "quarterly",
    meeting_day: "Last Saturday",
    quorum_percent: 60,
    loan_approval_threshold: 60,
    joining_fee: 0,
    loan_interest_rate: 5,
    loan_max_multiplier: 3,
  });

  // Step 3: Invites
  const [invites, setInvites] = useState<InviteRow[]>([
    { email: "", role: "treasurer" },
    { email: "", role: "secretary" },
  ]);

  // Result
  const [created, setCreated] = useState<{ id: string; invites: SeededInvite[] } | null>(null);

  // Match against the chair's own memberships (instant, no network).
  const myMatches = useMemo(() => {
    const q = normalize(basics.name);
    if (q.length < 3) return [];
    const tokens = q.split(" ").filter((t) => t.length >= 3);
    return chamas.filter((c) => {
      const n = normalize(c.name);
      return tokens.some((t) => n.includes(t));
    });
  }, [basics.name, chamas]);

  // Debounced public-records lookup.
  useEffect(() => {
    if (step !== 0) return;
    const q = basics.name.trim();
    if (q.length < 3) { setPublicMatches([]); return; }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await findSimilarChamas({
          data: { name: q, location: basics.location.trim() || null },
        });
        const mine = new Set(chamas.map((c) => c.id));
        setPublicMatches((res as Suggestion[]).filter((s) => !mine.has(s.id)));
      } catch {
        setPublicMatches([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [basics.name, basics.location, chamas, step]);

  // Any signed-in user may create a chama (they become the chairperson).


  const openMine = (id: string) => { setActiveId(id); navigate({ to: "/dashboard" }); };

  const validateStep = () => {
    if (step === 0) {
      if (basics.name.trim().length < 2) { toast.error("Chama name is too short"); return false; }
    }
    if (step === 1) {
      if (rules.contribution_amount < 0 || rules.late_penalty < 0) {
        toast.error("Amounts cannot be negative"); return false;
      }
    }
    if (step === 2) {
      const bad = invites.find((i) => i.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email.trim()));
      if (bad) { toast.error(`"${bad.email}" is not a valid email`); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep()) return;
    setBusy(true);
    try {
      const cleanInvites = invites
        .map((i) => ({ email: i.email.trim().toLowerCase(), role: i.role }))
        .filter((i) => i.email.length > 0);

      const res = await createChama({
        data: {
          name: basics.name.trim(),
          type: basics.type as any,
          location: basics.location.trim() || null,
          rules,
          invites: cleanInvites,
        },
      });
      await refresh();
      setActiveId(res.id);
      setCreated(res as { id: string; invites: SeededInvite[] });
      toast.success("Chama created — you're the Chairperson");
    } catch (err: any) {
      toast.error(err?.message ?? "Could not create chama");
    } finally {
      setBusy(false);
    }
  };

  if (created) {
    return (
      <Shell>
        <SuccessScreen
          created={created}
          onGoDashboard={() => navigate({ to: "/dashboard" })}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <Stepper current={step} />

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        {step === 0 && (
          <BasicsStep
            basics={basics}
            setBasics={setBasics}
            myMatches={myMatches}
            publicMatches={publicMatches}
            searching={searching}
            userEmail={user?.email ?? ""}
            openMine={openMine}
          />
        )}
        {step === 1 && <RulesStep rules={rules} setRules={setRules} />}
        {step === 2 && <InvitesStep invites={invites} setInvites={setInvites} />}
        {step === 3 && (
          <ReviewStep basics={basics} rules={rules} invites={invites.filter((i) => i.email.trim())} />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          className="h-11 rounded-xl"
          onClick={step === 0 ? () => navigate({ to: "/app" }) : back}
          disabled={busy}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="h-11 rounded-xl font-semibold" onClick={next}>
            Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button className="h-11 rounded-xl font-semibold" onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
            {busy ? "Creating…" : "Create chama"}
          </Button>
        )}
      </div>
    </Shell>
  );
}

/* ---------- Stepper ---------- */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                done ? "bg-primary text-primary-foreground"
                : active ? "bg-primary/15 text-primary ring-2 ring-primary"
                : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${done ? "bg-primary" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- Step 1: Basics ---------- */

function BasicsStep({
  basics, setBasics, myMatches, publicMatches, searching, userEmail, openMine,
}: {
  basics: { name: string; type: string; location: string };
  setBasics: (b: { name: string; type: string; location: string }) => void;
  myMatches: Array<{ id: string; name: string; type: string; location: string | null; role: string }>;
  publicMatches: Suggestion[];
  searching: boolean;
  userEmail: string;
  openMine: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Tell us about the chama</h2>
        <p className="mt-1 text-sm text-muted-foreground">You'll be the Chairperson. Signed in as <span className="font-medium text-foreground">{userEmail}</span>.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Chama name</Label>
        <Input
          id="name" placeholder="e.g. Umoja Investment Chama" value={basics.name}
          onChange={(e) => setBasics({ ...basics, name: e.target.value })}
          className="h-11 rounded-xl text-[15px]" autoFocus
        />
      </div>

      {myMatches.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="font-semibold text-foreground">You already have a similar chama</div>
              <div className="mt-3 space-y-2">
                {myMatches.map((c) => (
                  <button
                    key={c.id} type="button" onClick={() => openMine(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left hover:border-primary"
                  >
                    <Users className="h-4 w-4 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.type.replace(/_/g, " ")}{c.location ? ` · ${c.location}` : ""} · You're {c.role}
                      </div>
                    </div>
                    <LogIn className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {publicMatches.length > 0 && (
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm">
          <div className="font-semibold text-foreground">Similar chamas already on Chama-OS</div>
          <p className="mt-0.5 text-muted-foreground">If one is yours, ask its chairperson to invite {userEmail}.</p>
          <ul className="mt-3 space-y-1.5">
            {publicMatches.map((s) => (
              <li key={s.id} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.type.replace(/_/g, " ")}{s.location ? ` · ${s.location}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={basics.type} onValueChange={(v) => setBasics({ ...basics, type: v })}>
            <SelectTrigger className="h-11 rounded-xl text-[15px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map(([v, label]) => <SelectItem key={v} value={v}>{label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location (optional)</Label>
          <Input
            id="location" placeholder="e.g. Nairobi, Kenya" value={basics.location}
            onChange={(e) => setBasics({ ...basics, location: e.target.value })}
            className="h-11 rounded-xl text-[15px]"
          />
        </div>
      </div>

      {searching && <p className="text-xs text-muted-foreground">Checking existing chamas…</p>}
    </div>
  );
}

/* ---------- Step 2: Rules ---------- */

function RulesStep({
  rules, setRules,
}: {
  rules: {
    currency: string; contribution_amount: number; contribution_frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
    late_penalty: number; meeting_cadence: "weekly" | "biweekly" | "monthly" | "quarterly";
    meeting_day: string; quorum_percent: number; loan_approval_threshold: number;
  };
  setRules: (r: any) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Contribution & governance rules</h2>
        <p className="mt-1 text-sm text-muted-foreground">You can change all of this later from settings.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Currency</Label>
          <Input value={rules.currency} onChange={(e) => setRules({ ...rules, currency: e.target.value.toUpperCase() })}
            maxLength={6} className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Contribution amount</Label>
          <Input type="number" min={0} value={rules.contribution_amount}
            onChange={(e) => setRules({ ...rules, contribution_amount: Number(e.target.value) || 0 })}
            className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Contribution frequency</Label>
          <Select value={rules.contribution_frequency} onValueChange={(v) => setRules({ ...rules, contribution_frequency: v })}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQ.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Late payment penalty</Label>
          <Input type="number" min={0} value={rules.late_penalty}
            onChange={(e) => setRules({ ...rules, late_penalty: Number(e.target.value) || 0 })}
            className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Meeting cadence</Label>
          <Select value={rules.meeting_cadence} onValueChange={(v) => setRules({ ...rules, meeting_cadence: v })}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FREQ.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Meeting day</Label>
          <Input value={rules.meeting_day} placeholder="e.g. Last Saturday"
            onChange={(e) => setRules({ ...rules, meeting_day: e.target.value })}
            className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Quorum (% of members)</Label>
          <Input type="number" min={1} max={100} value={rules.quorum_percent}
            onChange={(e) => setRules({ ...rules, quorum_percent: Number(e.target.value) || 0 })}
            className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label>Loan approval threshold (%)</Label>
          <Input type="number" min={1} max={100} value={rules.loan_approval_threshold}
            onChange={(e) => setRules({ ...rules, loan_approval_threshold: Number(e.target.value) || 0 })}
            className="h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Step 3: Invites ---------- */

function InvitesStep({
  invites, setInvites,
}: {
  invites: InviteRow[];
  setInvites: (i: InviteRow[]) => void;
}) {
  const update = (idx: number, patch: Partial<InviteRow>) =>
    setInvites(invites.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  const add = () => setInvites([...invites, { email: "", role: "member" }]);
  const remove = (idx: number) => setInvites(invites.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Invite your members</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add emails and roles. After creating the chama you'll get a shareable join link for each.
          Members can also be added later from the Members tab.
        </p>
      </div>

      <div className="space-y-3">
        {invites.map((row, idx) => (
          <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_180px_auto]">
            <Input
              type="email" placeholder="member@example.com" value={row.email}
              onChange={(e) => update(idx, { email: e.target.value })}
              className="h-11 rounded-xl"
            />
            <Select value={row.role} onValueChange={(v) => update(idx, { role: v as Role })}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="chairperson">Co-Chairperson</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => remove(idx)} className="h-11 w-11">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={add} className="h-10 rounded-xl">
        <Plus className="mr-2 h-4 w-4" /> Add another
      </Button>
    </div>
  );
}

/* ---------- Step 4: Review ---------- */

function ReviewStep({
  basics, rules, invites,
}: {
  basics: { name: string; type: string; location: string };
  rules: any;
  invites: InviteRow[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Review & create</h2>
        <p className="mt-1 text-sm text-muted-foreground">One last look before we set this up.</p>
      </div>
      <Section title="Basics">
        <Row k="Name" v={basics.name} />
        <Row k="Type" v={basics.type.replace(/_/g, " ")} />
        <Row k="Location" v={basics.location || "—"} />
      </Section>
      <Section title="Rules">
        <Row k="Contribution" v={`${rules.currency} ${rules.contribution_amount} · ${rules.contribution_frequency}`} />
        <Row k="Late penalty" v={`${rules.currency} ${rules.late_penalty}`} />
        <Row k="Meetings" v={`${rules.meeting_cadence} · ${rules.meeting_day || "—"}`} />
        <Row k="Quorum" v={`${rules.quorum_percent}%`} />
        <Row k="Loan approval" v={`${rules.loan_approval_threshold}% vote`} />
      </Section>
      <Section title={`Invites (${invites.length})`}>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No initial invites — you can add members from the dashboard.</p>
        ) : (
          <ul className="space-y-1.5">
            {invites.map((i, idx) => (
              <li key={idx} className="flex items-center justify-between text-sm">
                <span>{i.email}</span>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{i.role}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

/* ---------- Success screen with shareable links ---------- */

function SuccessScreen({
  created, onGoDashboard,
}: {
  created: { id: string; invites: SeededInvite[] };
  onGoDashboard: () => void;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Link copied");
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
        <Check className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-center text-3xl font-bold tracking-tight">Chama created</h1>
      <p className="mt-2 text-center text-muted-foreground">
        You're the Chairperson. Share the links below with your members — they sign in with the same email
        and they're in.
      </p>

      {created.invites.length > 0 ? (
        <div className="mt-8 space-y-2">
          {created.invites.map((inv) => {
            const link = `${origin}/login?invite=${inv.token}`;
            return (
              <div key={inv.token} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="truncate">{inv.email}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {inv.role}
                      </span>
                    </div>
                    <code className="mt-2 block truncate rounded-md bg-muted px-2 py-1.5 text-xs">{link}</code>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copy(link, inv.token)} className="h-9">
                    {copied === inv.token ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
          No invites yet. You can add members anytime from the dashboard.
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button onClick={onGoDashboard} className="h-12 rounded-xl px-6 font-semibold">
          Go to dashboard <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 md:px-8">
          <Link to="/app" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sprout className="h-5 w-5" />
            </div>
            <div className="font-bold tracking-tight">Chama-OS</div>
          </Link>
          <div className="w-12" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">{children}</main>
    </div>
  );
}
