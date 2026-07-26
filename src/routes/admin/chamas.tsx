import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listAdminChamas } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/chamas")({ component: Page });

type Chama = Awaited<ReturnType<typeof listAdminChamas>>[number];

function Page() {
  const [rows, setRows] = useState<Chama[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    void listAdminChamas()
      .then((d) => setRows(d as Chama[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load chamas."));
  }, []);

  const filtered = (rows ?? []).filter((c) =>
    `${c.name} ${c.location ?? ""} ${c.chair ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeader title="Chamas" description="Every group registered on the platform." />

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, chair or location"
        className="mb-5 h-11 max-w-sm rounded-xl"
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {rows === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          <Building2 className="mx-auto mb-3 h-6 w-6" />
          No chamas match this search yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Chama</th>
                <th className="px-5 py-3 font-semibold">Chair</th>
                <th className="px-5 py-3 font-semibold">Members</th>
                <th className="px-5 py-3 font-semibold">Plan</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.type}
                      {c.location ? ` · ${c.location}` : ""}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.chair ?? "—"}</td>
                  <td className="px-5 py-4 text-foreground">{c.members}</td>
                  <td className="px-5 py-4">
                    <Badge variant="secondary" className="capitalize">
                      {c.plan}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-KE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
