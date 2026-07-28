import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AvatarUploader } from "@/components/AvatarUploader";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import { getPinStatus, setMyPin, removeMyPin } from "@/lib/pins.functions";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { chamaTypes } from "@/lib/chama.schemas";
import { getChamaSettings, updateChamaSettings } from "@/lib/chama-settings.functions";

export const Route = createFileRoute("/_authed/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [fontSize, setFontSize] = useState<"base" | "lg" | "xl">("base");
  const [language, setLanguage] = useState<"en" | "sw">("en");

  const applyFontSize = (size: "base" | "lg" | "xl") => {
    setFontSize(size);
    document.documentElement.dataset.fontSize = size === "base" ? "" : size;
  };

  const { active } = useChama();
  const isChair = active?.role === "chairperson";

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Settings" description="Your profile, security and how the app reads." />

      <Tabs defaultValue="profile" className="space-y-5">
        <TabsList className="h-12 flex-wrap rounded-xl bg-muted p-1">
          <TabsTrigger value="profile" className="h-10 rounded-lg px-4 text-[15px]">Profile</TabsTrigger>
          {isChair && (
            <TabsTrigger value="chama" className="h-10 rounded-lg px-4 text-[15px]">Chama setup</TabsTrigger>
          )}
          <TabsTrigger value="security" className="h-10 rounded-lg px-4 text-[15px]">Security</TabsTrigger>
          <TabsTrigger value="accessibility" className="h-10 rounded-lg px-4 text-[15px]">Accessibility</TabsTrigger>
          <TabsTrigger value="notifications" className="h-10 rounded-lg px-4 text-[15px]">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile"><ProfileCard /></TabsContent>
        {isChair && <TabsContent value="chama"><ChamaSetupCard /></TabsContent>}
        <TabsContent value="security"><SecurityCard /></TabsContent>


        <TabsContent value="accessibility">
          <Card title="Display & language" desc="Make the app comfortable to read.">
            <Field label="Font size">
              <RadioGroup value={fontSize} onValueChange={(v) => applyFontSize(v as "base" | "lg" | "xl")} className="flex gap-2">
                {(["base", "lg", "xl"] as const).map((s) => (
                  <Label key={s} htmlFor={`fs-${s}`}
                    className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${fontSize === s ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem id={`fs-${s}`} value={s} />
                    <span className="font-medium">{s === "base" ? "Normal" : s === "lg" ? "Large" : "Extra large"}</span>
                  </Label>
                ))}
              </RadioGroup>
            </Field>

            <Field label="Language">
              <RadioGroup value={language} onValueChange={(v) => setLanguage(v as "en" | "sw")} className="flex gap-2">
                <Label htmlFor="lang-en" className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${language === "en" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem id="lang-en" value="en" /><span className="font-medium">English</span>
                </Label>
                <Label htmlFor="lang-sw" className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 ${language === "sw" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem id="lang-sw" value="sw" /><span className="font-medium">Kiswahili</span>
                </Label>
              </RadioGroup>
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card title="Notification preferences" desc="Choose what reminders you receive.">
            <Field label="Contribution reminders"><Switch defaultChecked /></Field>
            <Field label="Loan due reminders"><Switch defaultChecked /></Field>
            <Field label="Meeting reminders"><Switch defaultChecked /></Field>
            <Field label="Announcements"><Switch defaultChecked /></Field>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileCard() {
  const { user } = useAuth();
  const { active } = useChama();
  const load = useServerFn(getMyProfile);
  const save = useServerFn(saveMyProfile);

  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void load()
      .then((p) => {
        setFullName(p.full_name ?? "");
        setDisplayName(p.display_name ?? "");
        setPhone(p.phone ?? "");
        setAvatar(p.avatar_url ?? null);
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    if (fullName.trim().length < 2 || displayName.trim().length < 2) {
      toast.error("Add your full name and a display name");
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          full_name: fullName.trim(),
          display_name: displayName.trim(),
          avatar_url: avatar,
          phone: phone.trim() || null,
        },
      });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-14">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card title="Profile" desc="How other members see you in your chama.">
      <Field label="Photo">
        <AvatarUploader
          userId={user?.id ?? ""}
          name={displayName || fullName}
          path={avatar}
          onUploaded={setAvatar}
        />
      </Field>
      <Field label="Full name">
        <Input className="h-11 rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>
      <Field label="Display name" hint="Shown across the dashboard.">
        <Input className="h-11 rounded-xl" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </Field>
      <Field label="Phone number">
        <Input className="h-11 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Email" hint="Used to sign in — contact your chairperson to change it.">
        <Input className="h-11 rounded-xl" value={user?.email ?? ""} readOnly />
      </Field>
      {active && (
        <Field label="Chama" hint="Your current group and role.">
          <div className="text-[15px] font-medium text-foreground">
            {active.name} · <span className="capitalize text-muted-foreground">{active.role}</span>
          </div>
        </Field>
      )}
      <div className="pt-2">
        <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save changes
        </Button>
      </div>
    </Card>
  );
}

function SecurityCard() {
  const { user } = useAuth();
  const status = useServerFn(getPinStatus);
  const savePin = useServerFn(setMyPin);
  const clearPin = useServerFn(removeMyPin);

  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void status()
      .then((s) => setHasPin(s.hasPin))
      .catch(() => setHasPin(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onSavePin = async () => {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("Your PIN must be 4 digits");
      return;
    }
    setBusy(true);
    try {
      await savePin({ data: { pin } });
      setPin("");
      setHasPin(true);
      toast.success("PIN saved — you can now sign in with it");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save PIN");
    } finally {
      setBusy(false);
    }
  };

  const onClearPin = async () => {
    setBusy(true);
    try {
      await clearPin();
      setHasPin(false);
      toast.success("PIN removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove PIN");
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    if (!user?.email) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for the reset link");
  };

  return (
    <Card title="Security" desc="Your own PIN and password — nobody else can change them.">
      <Field
        label="Quick sign-in PIN"
        hint={hasPin ? "A 4-digit PIN is active on your account." : "Set a 4-digit PIN for faster sign-in."}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-11 w-32 rounded-xl text-center tracking-[0.5em]"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          />
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={onSavePin}>
            <KeyRound className="mr-2 h-4 w-4" /> {hasPin ? "Change PIN" : "Set PIN"}
          </Button>
          {hasPin && (
            <Button variant="outline" className="h-11 rounded-xl" disabled={busy} onClick={onClearPin}>
              Remove PIN
            </Button>
          )}
        </div>
      </Field>

      <Field label="Password" hint="We email you a secure link to set a new password.">
        <Button variant="outline" className="h-11 rounded-xl" disabled={busy} onClick={sendReset}>
          <Mail className="mr-2 h-4 w-4" /> Send reset link
        </Button>
      </Field>

      <Field label="Account protection" hint="Your PIN is stored hashed and never shown to anyone.">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" /> Protected
        </div>
      </Field>
    </Card>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-border pt-5 first:border-0 first:pt-0 sm:grid-cols-[1fr_2fr] sm:items-center">
      <div>
        <div className="text-[15px] font-semibold text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function ChamaSetupCard() {
  const { active, refresh } = useChama();
  const load = useServerFn(getChamaSettings);
  const save = useServerFn(updateChamaSettings);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("investment");
  const [location, setLocation] = useState("");
  const [rules, setRules] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!active) return;
    setLoading(true);
    void load({ data: { chamaId: active.id } })
      .then((c: any) => {
        setName(c.name ?? "");
        setType(c.type ?? "investment");
        setLocation(c.location ?? "");
        setRules(c.rules ?? {});
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Could not load chama"))
      .finally(() => setLoading(false));
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const num = (k: string, fallback = 0) =>
    typeof rules[k] === "number" ? (rules[k] as number) : fallback;
  const setRule = (k: string, v: unknown) => setRules((r) => ({ ...r, [k]: v }));

  const submit = async () => {
    if (!active) return;
    if (name.trim().length < 2) {
      toast.error("Give your chama a name");
      return;
    }
    setBusy(true);
    try {
      await save({
        data: {
          chamaId: active.id,
          name: name.trim(),
          type: type as any,
          location: location.trim() || null,
          rules: {
            description: String(rules.description ?? ""),
            currency: String(rules.currency || "KES"),
            contribution_amount: num("contribution_amount"),
            contribution_frequency: (rules.contribution_frequency as any) ?? "monthly",
            late_penalty: num("late_penalty"),
            meeting_cadence: (rules.meeting_cadence as any) ?? "monthly",
            meeting_day: String(rules.meeting_day ?? ""),
            quorum_percent: num("quorum_percent", 60),
            loan_approval_threshold: num("loan_approval_threshold", 60),
            joining_fee: num("joining_fee"),
            loan_interest_rate: num("loan_interest_rate"),
            loan_max_multiplier: num("loan_max_multiplier", 3),
          },
        },
      });
      await refresh();
      toast.success("Chama settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  if (!active) {
    return (
      <Card title="Chama setup" desc="No group selected yet.">
        <p className="text-sm text-muted-foreground">Create or open a chama first.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border border-border bg-card py-14">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card title="Chama basics" desc="The details every member sees. Chairperson only.">
        <Field label="Chama name">
          <Input className="h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Type">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-11 rounded-xl capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              {chamaTypes.map((t) => (
                <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Location">
          <Input className="h-11 rounded-xl" value={location} onChange={(e) => setLocation(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea
            className="min-h-24 rounded-xl"
            value={String(rules.description ?? "")}
            onChange={(e) => setRule("description", e.target.value)}
          />
        </Field>
      </Card>

      <Card title="Contributions & meetings" desc="Change these anytime — they apply going forward.">
        <Field label="Currency">
          <Input
            className="h-11 w-32 rounded-xl"
            value={String(rules.currency ?? "KES")}
            onChange={(e) => setRule("currency", e.target.value.toUpperCase().slice(0, 8))}
          />
        </Field>
        <Field label="Contribution amount">
          <Input type="number" min={0} className="h-11 rounded-xl" value={num("contribution_amount")}
            onChange={(e) => setRule("contribution_amount", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Contribution frequency">
          <Select value={String(rules.contribution_frequency ?? "monthly")} onValueChange={(v) => setRule("contribution_frequency", v)}>
            <SelectTrigger className="h-11 rounded-xl capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["weekly", "biweekly", "monthly", "quarterly"].map((f) => (
                <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Late penalty">
          <Input type="number" min={0} className="h-11 rounded-xl" value={num("late_penalty")}
            onChange={(e) => setRule("late_penalty", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Joining fee">
          <Input type="number" min={0} className="h-11 rounded-xl" value={num("joining_fee")}
            onChange={(e) => setRule("joining_fee", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Meeting cadence">
          <Select value={String(rules.meeting_cadence ?? "monthly")} onValueChange={(v) => setRule("meeting_cadence", v)}>
            <SelectTrigger className="h-11 rounded-xl capitalize"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["weekly", "biweekly", "monthly", "quarterly"].map((f) => (
                <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Meeting day">
          <Input className="h-11 rounded-xl" value={String(rules.meeting_day ?? "")}
            onChange={(e) => setRule("meeting_day", e.target.value)} />
        </Field>
      </Card>

      <Card title="Quorum & loans" desc="The 60% you set during onboarding lives here — edit it anytime.">
        <Field label="Quorum" hint="Share of members needed for a valid meeting.">
          <div className="flex items-center gap-3">
            <Slider className="max-w-xs" min={1} max={100} step={1}
              value={[num("quorum_percent", 60)]}
              onValueChange={([v]) => setRule("quorum_percent", v)} />
            <span className="w-12 text-sm font-semibold text-foreground">{num("quorum_percent", 60)}%</span>
          </div>
        </Field>
        <Field label="Loan approval threshold" hint="Share of votes needed to approve a loan.">
          <div className="flex items-center gap-3">
            <Slider className="max-w-xs" min={1} max={100} step={1}
              value={[num("loan_approval_threshold", 60)]}
              onValueChange={([v]) => setRule("loan_approval_threshold", v)} />
            <span className="w-12 text-sm font-semibold text-foreground">{num("loan_approval_threshold", 60)}%</span>
          </div>
        </Field>
        <Field label="Loan interest rate (%)">
          <Input type="number" min={0} max={100} className="h-11 w-32 rounded-xl" value={num("loan_interest_rate")}
            onChange={(e) => setRule("loan_interest_rate", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Max loan multiplier" hint="Times a member's savings.">
          <Input type="number" min={0} max={20} step={0.5} className="h-11 w-32 rounded-xl" value={num("loan_max_multiplier", 3)}
            onChange={(e) => setRule("loan_max_multiplier", Number(e.target.value) || 0)} />
        </Field>
        <div className="pt-2">
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save chama settings
          </Button>
        </div>
      </Card>
    </div>
  );
}
