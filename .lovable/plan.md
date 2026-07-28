## Deductions in Finance

A new **Deductions** page under the Finance section of the sidebar.

**Creating a deduction (chairperson or treasurer):**
- Name (e.g. "Chama-OS cost share", "Office rent"), amount per member, optional note, date.
- Member picker with a **Select all** button, plus individual checkboxes and a search box.
- Live summary before saving: "12 members × Ksh 500 = Ksh 6,000".
- Saving records one row per selected member, immediately reducing each member's savings balance, and fires a bell notification to each affected member.

**What members see:**
- The Deductions page lists every deduction that touched them: name, amount, date, who recorded it.
- Chair/treasurer see the full group view grouped by deduction batch, with totals and a per-member breakdown.
- Balances on the dashboard and contributions page account for deductions, so net savings stay accurate.
- Deleting/reversing a deduction is chair-only and leaves a trail in Transparency.

## Loans — chair holds the decision

- Treasurer can record applications, add review notes, and move a loan to "under review"; they no longer see approve/reject.
- Chairperson gets the Approve / Reject actions with a decision note, on both the loans list and the loan detail.
- Borrower gets a bell notification on any status change.

## New modules

1. **Fines & penalties** — chair/treasurer issue a fine to one or many members (same select-all picker), with reason and status; members see their fines and get notified.
2. **Payouts (merry-go-round)** — an ordered rotation of members with scheduled dates, showing whose turn is next and marking payouts as disbursed.
3. **Member statements** — a per-member ledger (contributions in, deductions/fines out, loans, balance) for any date range, printable/downloadable. Members see only their own; chair/treasurer see anyone's.
4. **Budget & expenses** — group running costs (rent, Chama-OS fee, refreshments) against a budget per period, with a simple spent-vs-budget view.

## Suggested build order

Deductions + chair-only loan decisions first (this request), then Statements, Fines, Budget, Payouts.

## Technical notes

- New tables: `deductions` (batch: chama, name, amount, note, created_by) and `deduction_members` (deduction, member, amount, status), plus `fines`, `payouts`, `expenses` in later phases. Each gets GRANTs, RLS scoped to chama membership, and write policies restricted via `has_chama_role`.
- Writes go through new `deductions.functions.ts` / `deductions.server.ts` server functions using the existing `requirePermission` pattern; new permissions `finance.deduct` and `loans.decide` added to `src/lib/permissions.ts` (chair + treasurer, chair only respectively).
- `getChamaSnapshot` extended to return deductions so dashboard/contributions balances are net of them.
- Notifications inserted server-side per affected member in the same handler; bell count already reads live from `notifications`.
