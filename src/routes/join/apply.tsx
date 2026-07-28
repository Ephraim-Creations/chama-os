import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
import { PageFooter } from "@/components/PageFooter";
import { submitChairApplication } from "@/lib/access.functions";

export const Route = createFileRoute("/join/apply")({
  component: ApplyPage,
  head: () => ({
    meta: [
      { title: "Apply to open a chama — Chama-OS" },
      {
        name: "description",
        content:
          "Chairpersons: send your name, phone and chama details to open a group on Chama-OS. We review every application.",
      },
      { property: "og:title", content: "Apply to open a chama — Chama-OS" },
      {
        property: "og:description",
        content: "Send your details and we'll set your chama up on Chama-OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a reachable phone number")
    .max(30)
    .regex(/^[0-9+()\-\s]+$/, "Phone can only contain numbers and + ( ) -"),
  email: z.string().trim().email("Enter a valid email").max(255),
  chama_name: z.string().trim().min(2, "Enter your chama's name").max(120),
  location: z.string().trim().max(200).optional(),
  note: z.string().trim().max(600).optional(),
});

const empty = { full_name: "", phone: "", email: "", chama_name: "", location: "", note: "" };

function ApplyPage() {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { duplicate: boolean; status: string }>(null);

  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) next[err.path[0] as string] = err.message;
      });
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const res = await submitChairApplication({ data: parsed.data });
      setDone({ duplicate: res.duplicate, status: res.status });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send your application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-14 md:px-8 md:py-20">
        <Link
          to="/join"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {done ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h1 className="mt-5 text-2xl font-bold text-foreground">
              {done.status === "approved" ? "You're already approved" : "Enquiry received"}
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              {done.status === "approved"
                ? "Your email is already cleared. Check your inbox for the link to create your account, then set up your group."
                : done.duplicate
                  ? "We already have an enquiry for this email. We'll get back to you on the phone number you gave us."
                  : "Nothing has been created yet — this is an enquiry. We review every chairperson request by hand, then email you a link to create your account and set up your chama."}
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild className="h-11 rounded-xl px-6 font-semibold">
                <Link to="/login">Go to sign in</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-xl px-6 font-semibold">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Enquire about opening a chama
            </h1>
            <p className="mt-3 text-[15px] text-muted-foreground">
              Tell us who you are and which group you lead. Nothing is created yet — once we approve your
              enquiry we email you a link to create your account and set the group up yourself.
            </p>


            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <Field id="full_name" label="Your full name" error={errors.full_name}>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={set("full_name")}
                  placeholder="Jane Wanjiru"
                  className="h-11"
                  disabled={busy}
                />
              </Field>
              <Field id="phone" label="Phone number" error={errors.phone}>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+254 7xx xxx xxx"
                  className="h-11"
                  disabled={busy}
                />
              </Field>
              <Field id="email" label="Email address" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  className="h-11"
                  disabled={busy}
                />
                <p className="text-xs text-muted-foreground">
                  This becomes your sign-in email once you're approved.
                </p>
              </Field>
              <Field id="chama_name" label="Proposed chama name" error={errors.chama_name}>
                <Input
                  id="chama_name"
                  value={form.chama_name}
                  onChange={set("chama_name")}
                  placeholder="EC Welfare Group"
                  className="h-11"
                  disabled={busy}
                />
              </Field>
              <Field id="location" label="County / town (optional)" error={errors.location}>
                <Input
                  id="location"
                  value={form.location}
                  onChange={set("location")}
                  placeholder="Nairobi"
                  className="h-11"
                  disabled={busy}
                />
              </Field>
              <Field id="note" label="Anything we should know? (optional)" error={errors.note}>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={set("note")}
                  placeholder="How many members, how long you've been meeting..."
                  rows={4}
                  disabled={busy}
                />
              </Field>

              <Button
                type="submit"
                disabled={busy}
                className="h-12 w-full rounded-xl text-[15px] font-semibold"
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {busy ? "Sending..." : "Send application"}
              </Button>
            </form>
          </>
        )}
      </main>
      <PageFooter />
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
