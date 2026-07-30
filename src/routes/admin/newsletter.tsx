import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Copy, Check, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  listNewsletterSubscribers,
  setNewsletterSubscriberState,
} from "@/lib/marketing.functions";

export const Route = createFileRoute("/admin/newsletter")({ component: Page });

type Subscriber = Awaited<ReturnType<typeof listNewsletterSubscribers>>[number];

function Page() {
  const [rows, setRows] = useState<Subscriber[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () =>
    listNewsletterSubscribers()
      .then((d) => setRows(d as Subscriber[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the mailing list."));

  useEffect(() => {
    void load();
  }, []);

  const active = useMemo(() => (rows ?? []).filter((r) => r.subscribed), [rows]);

  const copyAll = async () => {
    await navigator.clipboard.writeText(active.map((r) => r.email).join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    const csv = ["email,source,subscribed,joined"]
      .concat((rows ?? []).map((r) => `${r.email},${r.source},${r.subscribed},${r.created_at}`))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "chama-os-newsletter.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!rows)
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Newsletter mailing list"
        description="Everyone who signed up from the website footer. Use this list for periodic newsletters."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm">
          <span className="font-semibold text-foreground">{active.length}</span>{" "}
          <span className="text-muted-foreground">active subscribers</span>
        </div>
        <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={() => void copyAll()}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy emails"}
        </Button>
        <Button variant="outline" size="sm" className="h-9 rounded-lg" onClick={downloadCsv}>
          <Download className="mr-1.5 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No subscribers yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("en-KE")}
                  </td>
                  <td className="px-4 py-3">
                    {r.subscribed ? (
                      <Badge variant="secondary">Subscribed</Badge>
                    ) : (
                      <Badge variant="outline">Unsubscribed</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg"
                      onClick={async () => {
                        await setNewsletterSubscriberState({
                          data: { id: r.id, subscribed: !r.subscribed },
                        });
                        void load();
                      }}
                    >
                      {r.subscribed ? "Unsubscribe" : "Resubscribe"}
                    </Button>
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
