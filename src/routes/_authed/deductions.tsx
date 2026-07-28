import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Scissors, Users, Search, Loader2, Trash2, Receipt,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ksh, initialsOf } from "@/lib/mock-data";
import { useSnapshot } from "@/hooks/use-snapshot";
import { useChama } from "@/context/chama-context";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { createDeductionFn, removeDeductionFn } from "@/lib/deductions.functions";

export const Route = createFileRoute("/_authed/deductions")({
  component: DeductionsPage,
  head: () => ({
    meta: [
      { title: "Deductions · Chama OS" },
      {
        name: "description",
        content:
          "Record shared costs deducted from member savings — rent, levies and Chama OS cost share — with a full per-member trail.",
      },
      { property: "og:title", content: "Deductions · Chama OS" },
      {
        property: "og:description",
        content: "Deduct shared costs from one member or the whole group, with records everyone can see.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function DeductionsPage() {
  const { active } = useChama();
  const { user } = useAuth();
  const { can, isChair } = usePermissions();
  const { snapshot, loading, refresh } = useSnapshot();
  const [query, setQuery] = useState("");

  const deductions = snapshot?.deductions ?? [];
  const mine = useMemo(
    () =>
      deductions
        .map((d) => ({ d, row: d.members.find((m) => m.memberId === user?.id) }))
        .filter((x) => x.row),
    [deductions, user?.id],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? deductions.filter((d) => d.name.toLowerCase().includes(q)) : deductions;
  }, [deductions, query]);

  const remove = useServerFn(removeDeductionFn);
  const [removing, setRemoving] = useState<string | null>(null);

  const onRemove = async (id: string) => {
    if (!active) return;
    setRemoving(id);
    try {
      await remove({ data: { chamaId: active.id, deductionId: id } });
      toast.success("Deduction reversed");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reverse this deduction");
    } finally {
      setRemoving(null);
    }
  };

  const myTotal = mine.reduce((a, x) => a + (x.row?.amount ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Deductions"
        description="Shared costs taken off member savings — rent, levies, Chama OS cost share. Records only, no money moves here."
        actions={
          can("finance.deduct") && active ? (
            <DeductionDialog
              chamaId={active.id}
              members={snapshot?.members ?? []}
              onDone={refresh}
            />
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Deducted overall" value={ksh(snapshot?.totals.deductionsTotal ?? 0)} icon={Scissors} accent="destructive" />
        <KpiCard label="Deduction runs" value={String(deductions.length)} icon={Receipt} accent="primary" />
        <KpiCard label="Your deductions" value={ksh(myTotal)} icon={Users} accent="info" />
        <KpiCard label="Net group savings" value={ksh(snapshot?.totals.savings ?? 0)} icon={Users} accent="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deductions…"
              className="h-11 rounded-xl pl-10 text-[15px]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No deductions yet"
            description="When the chair or treasurer deducts a shared cost, it shows here for everyone."
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((d) => {
              const yours = d.members.find((m) => m.memberId === user?.id);
              return (
                <div key={d.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-foreground">{d.name}</span>
                        {yours && (
                          <Badge className="rounded-full bg-destructive/10 text-destructive hover:bg-destructive/10">
                            You paid {ksh(yours.amount)}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {new Date(d.appliedOn).toLocaleDateString("en-KE")} · {d.members.length} member
                        {d.members.length === 1 ? "" : "s"} · {ksh(d.amountPerMember)} each
                        {d.notes ? ` · ${d.notes}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
                        <div className="font-semibold tabular-nums">{ksh(d.total)}</div>
                      </div>
                      {isChair && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={removing === d.id}
                          onClick={() => onRemove(d.id)}
                          aria-label={`Reverse ${d.name}`}
                        >
                          {removing === d.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                          <TableHead>Member</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {d.members.map((m) => (
                          <TableRow key={m.memberId} className="text-[15px]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-border">
                                  <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                                    {initialsOf(m.memberName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{m.memberName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">{ksh(m.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function DeductionDialog({
  chamaId,
  members,
  onDone,
}: {
  chamaId: string;
  members: Array<{ userId: string; displayName: string }>;
  onDone: () => void;
}) {
  const create = useServerFn(createDeductionFn);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? members.filter((m) => m.displayName.toLowerCase().includes(q)) : members;
  }, [members, search]);

  const allSelected = members.length > 0 && selected.length === members.length;
  const toggleAll = () => setSelected(allSelected ? [] : members.map((m) => m.userId));
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const per = Number(amount) || 0;

  const submit = async () => {
    if (name.trim().length < 2 || per <= 0 || selected.length === 0) {
      toast.error("Add a name, an amount and at least one member");
      return;
    }
    setBusy(true);
    try {
      const res = await create({
        data: {
          chamaId,
          name: name.trim(),
          amountPerMember: per,
          notes: notes.trim() || null,
          appliedOn: date,
          memberIds: selected,
        },
      });
      toast.success(`Deduction applied to ${res.members} member${res.members === 1 ? "" : "s"}`);
      setOpen(false);
      setName("");
      setAmount("");
      setNotes("");
      setSelected([]);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not apply this deduction");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl font-semibold">
          <Plus className="mr-2 h-4 w-4" /> New deduction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply a deduction</DialogTitle>
          <DialogDescription>
            Deduct a shared cost from one member or everyone. Each member is notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Deduction name</Label>
            <Input
              className="h-11 rounded-xl"
              placeholder="e.g. Chama OS cost share"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Amount per member (Ksh)</Label>
              <Input
                className="h-11 rounded-xl"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                className="h-11 rounded-xl"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Textarea
              rows={2}
              className="rounded-xl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What is this cost for?"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Members</Label>
              <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={toggleAll}>
                {allSelected ? "Clear all" : "Select all"}
              </Button>
            </div>
            <Input
              className="h-10 rounded-xl"
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
              {shown.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">No members match that search.</p>
              ) : (
                shown.map((m) => (
                  <label
                    key={m.userId}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
                  >
                    <Checkbox
                      checked={selected.includes(m.userId)}
                      onCheckedChange={() => toggle(m.userId)}
                    />
                    <span className="text-sm font-medium text-foreground">{m.displayName}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {selected.length} member{selected.length === 1 ? "" : "s"} × {ksh(per)} ={" "}
              <span className="font-semibold text-foreground">{ksh(per * selected.length)}</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Apply deduction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
