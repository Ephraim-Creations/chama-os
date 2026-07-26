import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Loader2, ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { decideChairApplication, listChairApplications } from "@/lib/access.functions";

export const Route = createFileRoute("/_authed/admin/applications")({
  component: ApplicationsPage,
  head: () => ({
    meta: [
      { title: "Chair applications — Chama-OS" },
      { name: "description", content: "Review and approve chairperson applications for Chama-OS." },
    ],
  }),
});

type Application = Awaited<ReturnType<typeof listChairApplications>>[number];

function ApplicationsPage() {
  const [rows, setRows] = useState<Application[] | null>(null);
  const [denied, setDenied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setRows((await listChairApplications()) as Application[]);
    } catch {
      setDenied(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, decision: "approved" | "rejected") {
    setBusyId(id);
    try {
      await decideChairApplication({ data: { id, decision } });
      toast.success(decision === "approved" ? "Approved" : "Rejected");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusyId(null);
    }
  }

  if (denied) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">Not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is only for Chama-OS platform admins.
        </p>
      </div>
    );
  }

  const pending = rows?.filter((r) => r.status === "pending") ?? [];
  const decided = rows?.filter((r) => r.status !== "pending") ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Chair applications"
        description="People asking to open a chama on Chama-OS. Approving lets them sign in and set up their group."
      />

      {rows === null ? (
        <div className="mt-10 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <Section title={`Pending (${pending.length})`}>
            {pending.length === 0 ? (
              <Empty>No applications waiting for you.</Empty>
            ) : (
              pending.map((a) => (
                <Card key={a.id}>
                  <Details a={a} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={busyId === a.id}
                      onClick={() => decide(a.id, "approved")}
                      className="h-9 rounded-lg font-semibold"
                    >
                      <Check className="mr-1.5 h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === a.id}
                      onClick={() => decide(a.id, "rejected")}
                      className="h-9 rounded-lg font-semibold"
                    >
                      <X className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </Section>

          <Section title={`Reviewed (${decided.length})`}>
            {decided.length === 0 ? (
              <Empty>Nothing reviewed yet.</Empty>
            ) : (
              decided.map((a) => (
                <Card key={a.id}>
                  <Details a={a} />
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                      a.status === "approved"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {a.status}
                  </span>
                </Card>
              ))
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <ShieldCheck className="h-4 w-4" /> {title}
      </h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      {children}
    </div>
  );
}

function Details({ a }: { a: Application }) {
  return (
    <div className="min-w-0">
      <div className="text-base font-semibold text-foreground">{a.chama_name}</div>
      <div className="text-sm text-muted-foreground">{a.full_name}</div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" /> {a.email}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5" /> {a.phone}
        </span>
        {a.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> {a.location}
          </span>
        )}
      </div>
      {a.note && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{a.note}</p>}
    </div>
  );
}
