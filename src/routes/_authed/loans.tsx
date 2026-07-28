import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, HandCoins, AlertTriangle, CheckCircle2, Percent, Loader2, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
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
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import {
  recordLoan,
  decideLoanFn,
  setLoanPlanFn,
  addLoanRepaymentFn,
  removeLoanRepaymentFn,
} from "@/lib/records.functions";

export const Route = createFileRoute("/_authed/loans")({
  component: LoansPage,
});

const statusColor: Record<string, string> = {
  active: "bg-info/10 text-info hover:bg-info/10",
  approved: "bg-info/10 text-info hover:bg-info/10",
  overdue: "bg-destructive/10 text-destructive hover:bg-destructive/10",
  completed: "bg-success/10 text-success hover:bg-success/10",
  pending: "bg-warning/15 text-warning hover:bg-warning/15",
  under_review: "bg-warning/15 text-warning hover:bg-warning/15",
  rejected: "bg-muted text-muted-foreground hover:bg-muted",
};

function LoansPage() {
  const { active } = useChama();
  const { can, isChair } = usePermissions();
  const { snapshot, loading, refresh } = useSnapshot();

  const loans = snapshot?.loans ?? [];
  const outstanding = loans
    .filter((l) => ["active", "approved", "overdue"].includes(l.status))
    .reduce((a, l) => a + (l.amount - l.amountRepaid), 0);
  const activeCount = loans.filter((l) => ["active", "approved"].includes(l.status)).length;
  const overdue = loans.filter((l) => l.status === "overdue").length;
  const completed = loans.filter((l) => l.status === "completed").length;
  const rate = loans.length ? Math.round((completed / loans.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Loans"
        description="Records only — Chama OS does not disburse or hold any money."
        actions={active ? <LoanDialog chamaId={active.id} members={snapshot?.members ?? []} canManage={can("loans.manage")} myLimit={Math.max((snapshot?.members ?? []).find((m) => m.userId === user?.id)?.loanLimit ?? 0, 0)} onDone={refresh} /> : null}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active loans" value={String(activeCount)} icon={HandCoins} accent="warning" />
        <KpiCard label="Outstanding" value={ksh(outstanding)} icon={Percent} accent="primary" />
        <KpiCard label="Overdue" value={String(overdue)} icon={AlertTriangle} accent="destructive" />
        <KpiCard label="Repayment rate" value={`${rate}%`} icon={CheckCircle2} accent="primary" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="grid place-items-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : loans.length === 0 ? (
          <EmptyState
            icon={HandCoins}
            title="No loans recorded"
            description="Loan applications and issued loans will show up here."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Borrower</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="min-w-[180px]">Repayment</TableHead>
                  <TableHead>Status</TableHead>
                  {(isChair || can("loans.manage")) && <TableHead className="text-right">Decision</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((l) => {
                  const pct = l.amount ? Math.round((l.amountRepaid / l.amount) * 100) : 0;
                  return (
                    <TableRow key={l.id} className="text-[15px]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                              {initialsOf(l.borrowerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-foreground">{l.borrowerName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-muted-foreground">{l.purpose}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{ksh(l.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={pct} className="h-2" />
                          <span className="w-10 text-right text-sm font-semibold tabular-nums">{pct}%</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {ksh(l.amountRepaid)} of {ksh(l.amount)}
                          {l.installmentAmount
                            ? ` · ${ksh(l.installmentAmount)} ${l.frequency ?? "monthly"}`
                            : ""}
                        </div>
                        {l.planNotes && (
                          <div className="mt-1 text-xs text-muted-foreground">{l.planNotes}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColor[l.status] ?? ""} capitalize`}>
                          {l.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      {(isChair || can("loans.manage")) && (
                        <TableCell className="text-right">
                          {active && (
                            <div className="flex items-center justify-end gap-2">
                              {can("loans.manage") &&
                                ["approved", "active", "overdue", "completed"].includes(l.status) && (
                                  <LoanPlanDialog chamaId={active.id} loan={l} onDone={refresh} />
                                )}
                              <LoanActions
                                chamaId={active.id}
                                loanId={l.id}
                                status={l.status}
                                isChair={isChair}
                                canReview={can("loans.manage")}
                                onDone={refresh}
                              />
                            </div>
                          )}
                        </TableCell>
                      )}

                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

function LoanActions({
  chamaId,
  loanId,
  status,
  isChair,
  canReview,
  onDone,
}: {
  chamaId: string;
  loanId: string;
  status: string;
  isChair: boolean;
  canReview: boolean;
  onDone: () => void;
}) {
  const decide = useServerFn(decideLoanFn);
  const [busy, setBusy] = useState<string | null>(null);
  const [pending, setPending] = useState<"approved" | "rejected" | "under_review" | null>(null);
  const [note, setNote] = useState("");

  if (!["pending", "under_review"].includes(status)) {
    return <span className="text-xs text-muted-foreground">Decided</span>;
  }

  const run = async (decision: "approved" | "rejected" | "under_review") => {
    setBusy(decision);
    try {
      await decide({ data: { chamaId, loanId, decision, note: note.trim() || null } });
      toast.success(
        decision === "approved"
          ? "Loan approved"
          : decision === "rejected"
            ? "Loan rejected"
            : "Loan sent to the chairperson",
      );
      setPending(null);
      setNote("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update this loan");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        {!isChair && canReview && status === "pending" && (
          <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setPending("under_review")}>
            Send to chair
          </Button>
        )}
        {isChair && (
          <>
            <Button size="sm" className="rounded-lg font-semibold" onClick={() => setPending("approved")}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg text-destructive hover:text-destructive"
              onClick={() => setPending("rejected")}
            >
              Reject
            </Button>
          </>
        )}
        {!isChair && !canReview && <span className="text-xs text-muted-foreground">Awaiting chair</span>}
      </div>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pending === "approved"
                ? "Approve this loan"
                : pending === "rejected"
                  ? "Reject this loan"
                  : "Send to the chairperson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-left">
            <Label>Notes for the borrower (optional)</Label>
            <Textarea
              rows={4}
              className="rounded-xl"
              placeholder="Explain the decision, conditions or next steps…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              className="h-11 rounded-xl font-semibold"
              disabled={!!busy}
              onClick={() => pending && run(pending)}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending === "rejected" ? "Reject loan" : pending === "approved" ? "Approve loan" : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type SnapshotLoan = {
  id: string;
  amount: number;
  amountRepaid: number;
  months: number;
  startDate: string | null;
  installmentAmount: number | null;
  frequency: string | null;
  planNotes: string | null;
  repayments: Array<{ id: string; amount: number; paidOn: string; note: string | null }>;
};

function LoanPlanDialog({
  chamaId,
  loan,
  onDone,
}: {
  chamaId: string;
  loan: SnapshotLoan;
  onDone: () => void;
}) {
  const savePlan = useServerFn(setLoanPlanFn);
  const addPayment = useServerFn(addLoanRepaymentFn);
  const removePayment = useServerFn(removeLoanRepaymentFn);

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(loan.startDate ?? "");
  const [installment, setInstallment] = useState(loan.installmentAmount ? String(loan.installmentAmount) : "");
  const [frequency, setFrequency] = useState(loan.frequency ?? "monthly");
  const [months, setMonths] = useState(String(loan.months ?? 6));
  const [planNotes, setPlanNotes] = useState(loan.planNotes ?? "");
  const [busy, setBusy] = useState(false);

  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState("");
  const [payBusy, setPayBusy] = useState(false);

  const balance = Math.max(loan.amount - loan.amountRepaid, 0);

  const submitPlan = async () => {
    setBusy(true);
    try {
      await savePlan({
        data: {
          chamaId,
          loanId: loan.id,
          startDate: startDate || null,
          installmentAmount: Number(installment) > 0 ? Number(installment) : null,
          frequency: frequency as "weekly" | "biweekly" | "monthly" | "quarterly",
          planNotes: planNotes.trim() || null,
          months: Number(months) > 0 ? Number(months) : null,
        },
      });
      toast.success("Payment plan saved");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the plan");
    } finally {
      setBusy(false);
    }
  };

  const submitPayment = async () => {
    if (!Number(payAmount)) {
      toast.error("Enter the amount paid");
      return;
    }
    setPayBusy(true);
    try {
      await addPayment({
        data: {
          chamaId,
          loanId: loan.id,
          amount: Number(payAmount),
          paidOn: payDate,
          note: payNote.trim() || null,
        },
      });
      toast.success("Payment recorded");
      setPayAmount("");
      setPayNote("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record that payment");
    } finally {
      setPayBusy(false);
    }
  };

  const deletePayment = async (repaymentId: string) => {
    try {
      await removePayment({ data: { chamaId, repaymentId } });
      toast.success("Payment removed");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove that payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-lg">
          <CalendarClock className="mr-2 h-4 w-4" /> Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment plan & payments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
            Balance: <span className="font-semibold tabular-nums">{ksh(balance)}</span> of {ksh(loan.amount)}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First payment date</Label>
              <Input type="date" className="h-11 rounded-xl" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Installment (Ksh)</Label>
              <Input className="h-11 rounded-xl" inputMode="numeric" value={installment} onChange={(e) => setInstallment(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period (months)</Label>
              <Input className="h-11 rounded-xl" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plan description</Label>
            <Textarea
              rows={3}
              className="rounded-xl"
              placeholder="e.g. Ksh 5,000 every month by M-Pesa before the 5th."
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
            />
          </div>

          <Button className="h-11 w-full rounded-xl font-semibold" disabled={busy} onClick={submitPlan}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save plan
          </Button>

          <div className="border-t border-border pt-4">
            <div className="mb-3 text-sm font-semibold">Record a payment</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount (Ksh)</Label>
                <Input className="h-11 rounded-xl" inputMode="numeric" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date paid</Label>
                <Input type="date" className="h-11 rounded-xl" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Label>Description (optional)</Label>
              <Textarea rows={2} className="rounded-xl" placeholder="Reference, channel or comment…" value={payNote} onChange={(e) => setPayNote(e.target.value)} />
            </div>
            <Button variant="outline" className="mt-3 h-11 w-full rounded-xl font-semibold" disabled={payBusy} onClick={submitPayment}>
              {payBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add payment
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <div className="mb-2 text-sm font-semibold">Payments so far</div>
            {loan.repayments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {loan.repayments.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tabular-nums">{ksh(r.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(r.paidOn).toLocaleDateString()}
                        {r.note ? ` · ${r.note}` : ""}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePayment(r.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


function LoanDialog({
  chamaId,
  members,
  canManage,
  myLimit,
  onDone,
}: {
  chamaId: string;
  members: Array<{ userId: string; displayName: string }>;
  canManage: boolean;
  myLimit: number;
  onDone: () => void;
}) {
  const save = useServerFn(recordLoan);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [borrowerId, setBorrowerId] = useState(user?.id ?? "");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [months, setMonths] = useState("6");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!borrowerId || !Number(amount) || purpose.trim().length < 3) {
      toast.error("Fill in borrower, amount and purpose");
      return;
    }
    if (!canManage && Number(amount) > myLimit) {
      toast.error(
        myLimit > 0
          ? `Your loan limit is ${ksh(myLimit)}.`
          : "Your loan limit is Ksh 0 — save more to become eligible.",
      );
      return;
    }
    setBusy(true);
    try {
      await save({
        data: { chamaId, borrowerId, amount: Number(amount), purpose: purpose.trim(), months: Number(months) || 6 },
      });
      toast.success(canManage ? "Loan recorded" : "Loan application submitted");
      setOpen(false);
      setAmount("");
      setPurpose("");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save loan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 rounded-xl font-semibold">
          <Plus className="mr-2 h-4 w-4" /> {canManage ? "Record loan" : "Apply for loan"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{canManage ? "Record a loan" : "Apply for a loan"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {canManage && (
            <div className="space-y-2">
              <Label>Borrower</Label>
              <Select value={borrowerId} onValueChange={setBorrowerId}>
                <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Choose a member" /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>{m.displayName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Amount (Ksh)</Label>
            <Input className="h-11 rounded-xl" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {!canManage && (
              <p className="text-xs text-muted-foreground">
                {myLimit > 0
                  ? `Your limit is ${ksh(myLimit)}.`
                  : "Your loan limit is Ksh 0 — save more to become eligible."}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Purpose</Label>
            <Input className="h-11 rounded-xl" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Repayment period (months)</Label>
            <Input className="h-11 rounded-xl" inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button className="h-11 rounded-xl font-semibold" disabled={busy} onClick={submit}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
