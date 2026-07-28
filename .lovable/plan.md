## 1. Loan limit never goes negative

Today **My stats** shows `Loan eligibility = savings × 3` hardcoded — so a member sitting at −10 shows −30. Two fixes:

- Use the chairperson's setting instead of the fixed 3. The Chama setup tab already saves `loan_max_multiplier` (default 3) into the chama rules; it just isn't read anywhere yet.
- Floor the result: if savings are zero or negative, eligibility is **Ksh 0**, with a small caption like "Save more to unlock a loan" instead of a negative figure.
- Apply the same floor wherever a limit is shown or checked: My stats card, the loan application form's max hint, and the server-side check when a loan is submitted (a member at 0 cannot apply).

## 2. Deductions visible to everyone — confirmed, plus a small gap

Checked the access rules: the Deductions page is already open to every member (`finance.view`), and each run lists every member's share, so nothing is hidden. Only the "New deduction" and reverse buttons stay with chair/treasurer, which is right.

The one gap: a member has no per-person deductions history in **My stats**. Add a "Deductions taken" breakdown there listing each run and the amount taken from that member.

## 3. Activity log actually logs things

Right now `transparency_logs` only receives a row when the chair reverses a deduction — which is why the Activity log looks empty. Extend logging to every money-touching action:

| Action | Logged as |
| --- | --- |
| Contribution recorded / edited | create / update |
| Deduction applied and reversed | create / delete |
| Loan applied, approved, rejected | create / update, with the note as reason |
| Payment plan set, repayment added/removed | update |
| Investment added / value updated | create / update |

Each row keeps who did it, before/after values and any note typed in the dialog. The Activity log page then gets:

- Plain-English lines ("Treasurer recorded a Ksh 2,000 savings contribution for Jane") instead of raw table names and UUIDs.
- A filter row: All / Contributions / Deductions / Loans / Investments.
- Everyone in the chama can read it (already the case in the access rules).

## Technical notes

- New `logChange()` helper in `src/lib/records.server.ts` (service-role insert into `transparency_logs`), called from the contribution, loan, repayment, deduction and investment write paths.
- `src/lib/chama-data.server.ts`: expose `rules.loan_max_multiplier` and a per-member `loanLimit = max(savings, 0) * multiplier` in the snapshot so UI and server agree on one number.
- `src/routes/_authed/member.tsx`: replace `savings * 3`, add the deductions breakdown.
- `src/routes/_authed/transparency.tsx`: human-readable rendering + filters.
- No database changes needed — `transparency_logs` and the chama `rules` JSON already carry everything.
