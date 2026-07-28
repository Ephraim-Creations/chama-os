import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2, UserRound, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AvatarUploader } from "@/components/AvatarUploader";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { useChama } from "@/context/chama-context";
import { getMyProfile, saveMyProfile } from "@/lib/profile.functions";
import { getAccessStatus } from "@/lib/access.functions";
import { createChama } from "@/lib/chama.functions";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "Get started · Chama OS" },
      { name: "description", content: "Set up your profile and your chama in three simple steps." },
      { property: "og:title", content: "Get started · Chama OS" },
      { property: "og:description", content: "Set up your profile and your chama in three simple steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Seed = { email: string; role: "treasurer" | "secretary" | "member" };

const CHAMA_TYPES = [
  "investment", "welfare", "sacco", "table_banking",
  "women", "men", "youth", "church", "community",
] as const;

function Onboarding() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { refresh } = useChama();

  const loadProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(saveMyProfile);
  const access = useServerFn(getAccessStatus);
  const create = useServerFn(createChama);

  const [ready, setReady] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // profile
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  // chama basics
  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof CHAMA_TYPES)[number]>("investment");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // rules
  const [amount, setAmount] = useState("2000");
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly" | "quarterly">("monthly");
  const [cadence, setCadence] = useState<"weekly" | "biweekly" | "monthly" | "quarterly">("monthly");
  const [quorum, setQuorum] = useState("60");

  // invites
  const [seeds, setSeeds] = useState<Seed[]>([{ email: "", role: "treasurer" }]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    void Promise.all([loadProfile(), access()])
      .then(([p, a]) => {
        setFullName(p.full_name ?? "");
        setDisplayName(p.display_name ?? "");
        setPhone(p.phone ?? "");
        setAvatar(p.avatar_url ?? null);
        if (a.isPlatformAdmin) {
          navigate({ to: "/admin", replace: true });
          return;
        }
        if (p.onboarded && a.memberships > 0) {
          navigate({ to: "/dashboard", replace: true });
          return;
        }
        setCanCreate(a.canCreateChama && a.memberships === 0);
        if (p.onboarded) setStep(1);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = useMemo(
    () =>
      canCreate
        ? ["Your profile", "Name your chama", "Set the rules", "Invite members"]
        : ["Your profile"],
    [canCreate],
  );

  const saveProfileStep = async () => {
    if (fullName.trim().length < 2) return toast.error("Add your full name");
    if (displayName.trim().length < 2) return toast.error("Add a display name");
    setBusy(true);
    try {
      await saveProfile({
        data: {
          full_name: fullName.trim(),
          display_name: displayName.trim(),
          avatar_url: avatar,
          phone: phone.trim() || null,
          markOnboarded: true,
        },
      });
      if (canCreate) setStep(1);
      else {
        await refresh();
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (name.trim().length < 2) {
      setStep(1);
      return toast.error("Give your chama a name");
    }
    setBusy(true);
    try {
      const invites = seeds
        .map((s) => ({ email: s.email.trim().toLowerCase(), role: s.role }))
        .filter((s) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.email));

      await create({
        data: {
          name: name.trim(),
          type,
          location: location.trim() || null,
          rules: {
            contribution_amount: Number(amount) || 0,
            contribution_frequency: frequency,
            meeting_cadence: cadence,
            quorum_percent: Number(quorum) || 50,
            description: description.trim(),
            currency: "KES",
          },
          invites,
        },
      });
      await refresh().catch((error) => {
        console.error("[onboarding] refresh after chama creation", error);
      });
      toast.success(
        invites.length
          ? `Your chama is ready — we emailed ${invites.length} sign-in link${invites.length > 1 ? "s" : ""}.`
          : "Your chama is ready",
      );
      navigate({ to: "/dashboard", replace: true });

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create your chama");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <div className="text-lg font-bold tracking-tight text-foreground">Chama OS</div>
        <ThemeToggle />
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 py-10 md:py-14">
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-semibold ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/15 text-primary ring-2 ring-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-[28px]">
            {steps[step]}
          </h1>

          {step === 0 && (
            <>
              <p className="mt-1 text-[15px] text-muted-foreground">
                This is how your group will recognise you.
              </p>
              <div className="mt-6 space-y-5">
                <AvatarUploader
                  userId={user?.id ?? ""}
                  name={displayName || fullName}
                  path={avatar}
                  onUploaded={setAvatar}
                />
                <div className="space-y-2">
                  <Label>Full name</Label>
                  <Input className="h-11 rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Wanjiku" />
                </div>
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input className="h-11 rounded-xl" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <Label>Phone number <span className="text-muted-foreground">(optional)</span></Label>
                  <Input className="h-11 rounded-xl" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07xx xxx xxx" />
                </div>
              </div>
              <Nav
                busy={busy}
                onNext={saveProfileStep}
                nextLabel={canCreate ? "Continue" : "Go to my dashboard"}
                icon={UserRound}
              />
            </>
          )}

          {step === 1 && (
            <>
              <p className="mt-1 text-[15px] text-muted-foreground">
                Add the basics — you become the Chairperson.
              </p>
              <div className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Chama name</Label>
                  <Input className="h-11 rounded-xl" value={name} onChange={(e) => setName(e.target.value)} placeholder="EC Welfare Group" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CHAMA_TYPES.map((t) => (
                          <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input className="h-11 rounded-xl" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Nairobi" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Short description</Label>
                  <Textarea className="min-h-24 rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is your group about?" />
                </div>
              </div>
              <Nav busy={busy} onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Continue" icon={Users} />
            </>
          )}

          {step === 2 && (
            <>
              <p className="mt-1 text-[15px] text-muted-foreground">You can edit all of this later.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Contribution amount (KSh)</Label>
                  <Input className="h-11 rounded-xl" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                </div>
                <div className="space-y-2">
                  <Label>How often</Label>
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["weekly", "biweekly", "monthly", "quarterly"].map((f) => (
                        <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Meeting cadence</Label>
                  <Select value={cadence} onValueChange={(v) => setCadence(v as typeof cadence)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["weekly", "biweekly", "monthly", "quarterly"].map((f) => (
                        <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quorum (%)</Label>
                  <Input className="h-11 rounded-xl" inputMode="numeric" value={quorum} onChange={(e) => setQuorum(e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>
              <Nav busy={busy} onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continue" icon={Wallet} />
            </>
          )}

          {step === 3 && (
            <>
              <p className="mt-1 text-[15px] text-muted-foreground">
                We email each person a link to set their password. They join automatically when they sign in.
              </p>
              <div className="mt-6 space-y-3">
                {seeds.map((s, i) => (
                  <div key={i} className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      className="h-11 flex-1 rounded-xl"
                      placeholder="member@email.com"
                      value={s.email}
                      onChange={(e) =>
                        setSeeds((prev) => prev.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))
                      }
                    />
                    <Select
                      value={s.role}
                      onValueChange={(v) =>
                        setSeeds((prev) => prev.map((x, j) => (j === i ? { ...x, role: v as Seed["role"] } : x)))
                      }
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl sm:w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treasurer">Treasurer</SelectItem>
                        <SelectItem value="secretary">Secretary</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 rounded-xl"
                      onClick={() => setSeeds((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => setSeeds((prev) => [...prev, { email: "", role: "member" }])}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add another
                </Button>
              </div>
              <Nav busy={busy} onBack={() => setStep(2)} onNext={finish} nextLabel="Create my chama" icon={Check} />
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function Nav({
  busy, onBack, onNext, nextLabel,
}: {
  busy: boolean;
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  icon?: unknown;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {onBack ? (
        <Button type="button" variant="ghost" className="h-11 rounded-xl" onClick={onBack} disabled={busy}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      <Button className="h-11 rounded-xl px-6 font-semibold" onClick={onNext} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {nextLabel}
        {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>
    </div>
  );
}
