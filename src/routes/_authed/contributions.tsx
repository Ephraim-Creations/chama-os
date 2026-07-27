import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, Search, Wallet, TrendingUp, AlertCircle, CheckCircle2, Inbox, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KpiCard } from "@/components/KpiCard";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ksh, initialsOf } from "@/lib/mock-data";
import { useSnapshot } from "@/hooks/use-snapshot";
import { useChama } from "@/context/chama-context";
import { usePermissions } from "@/hooks/use-permissions";
import { recordContribution } from "@/lib/records.functions";

export const Route = createFileRoute("/_authed/contributions")({
  component: ContributionsPage,
});

const TYPES = ["savings", "welfare", "project", "penalty", "withdrawal", "investment"] as const;

function ContributionsPage() {
  const { active } = useChama();
  const { can } = usePermissions();
  const { snapshot, loading, refresh } = useSnapshot();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const list = snapshot?.contributions ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((c) => c.memberName.toLowerCase().includes(q) || c.type.includes(q)) : list;
  }, [snapshot, query]);

  const now = new Date();
  const thisMonth = (snapshot?.contributions ?? []).filter((c) => {
    const d = new Date(c.recordedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const sum = (t: string) =>
    (snapshot?.contributions ?? []).filter((c) => c.type === t).reduce((a, c) => a + c.amount, 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Contributions"
        description="Track every shilling recorded — savings, welfare, projects and penalties."
        actions={
          can("finance.manage") && active ? (
            <RecordDialog chamaId={active.id} members={snapshot?.members ?? []} onDone={refresh} />
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="This month" value={ksh(thisMonth.reduce((a, c) => a + c.amount, 0))} icon={Wallet} accent="primary" />
        <KpiCard label="Welfare collected" value={ksh(sum("welfare"))} icon={TrendingUp} accent="info" />
        <KpiCard label="Penalties" value={ksh(sum("penalty"))} icon={AlertCircle} accent="destructive" />
        <KpiCard label="Entries" value={String(snapshot?.contributions.length ?? 0)} icon={CheckCircle2} accent="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by member or type…"
              className="h-11 rounded-xl pl-10 text-[15px]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No contributions yet"
            description="Contributions recorded by the treasurer will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id} className="text-[15px]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initialsOf(c.memberName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium text-foreground">{c.memberName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-full capitalize">{c.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(c.recordedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-muted-foreground">{c.notes ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{ksh(c.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function RecordDialog({
  chamaId,
  members,
  onDone,
}: {
  chamaId: string;
  members: Array<{ userId: string; displayName: string }>;
  onDone: () => void;
}) {
  const record = useServerFn(recordContribution);
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("savings");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!memberId || !Number(amount)) {
      toast.error("Pick a member and enter an amount");
      return;
    }
    setBusy(true);
    try {
      await record({ data: { chamaId, memberId, type, amount: Number(amount), notes: notes || null } });
      toast.success("Contribution recorded");
      setOpen(false);
      setAmount("");
      setNotes("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Record contribution
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a contribution</DialogTitle>
          <DialogDescription>Chama OS keeps records only — no money moves here.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Member</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose a member" /></SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>{m.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount (Ksh)</Label>
            <Input className="h-11 rounded-xl" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input className="h-11 rounded-xl" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
