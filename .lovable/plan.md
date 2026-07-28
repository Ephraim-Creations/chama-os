## What's actually happening

I checked the data behind the admin dashboard. The 18 groups are **not** created by the application form — approving an application never creates a chama today. Of the 18 groups, **17 have zero members and zero invites**: they are leftovers from repeated "Create my chama" clicks during the period the chairperson-role step was failing. Each attempt inserted a group row, then failed on the chairperson step, and the cleanup didn't remove the row. Only one group ("asdfghj") is real.

So there are two things to fix: the duplicate/garbage groups, and the flow itself so the two stages are clearly separated.

## Target flow

```text
1. Enquiry     /join/apply  -> chair_applications row (no account, no chama)
2. Review      /admin/applications -> approve / reject
3. Invite      approval emails a one-time "Create your account" link
4. Account     /set-password -> password + PIN
5. Onboarding  /onboarding -> profile, then chama basics/rules/invites (ONE chama)
6. Dashboard
```

Applications stay pure enquiries, exactly like a contact/booking submission. The chama only ever comes into existence at step 5, once.

## Changes

**1. Stop duplicate groups at the source (server)**
- In the chama creation logic, before inserting: if the user already has any membership, return the existing chama instead of creating a new one. This makes a double click or retry idempotent.
- Also reject a second group with the same name created by the same user within a short window.
- Wrap creation so a failed chairperson step reliably removes the half-created group (current cleanup left rows behind).

**2. Stop duplicate submits in the UI**
- Onboarding "Create my chama" disables immediately and guards against re-entry while a request is in flight, and after a success it never re-submits (currently only a `busy` flag that reset on error, letting each retry create another group).
- On failure, show whether the group was actually created and, if so, route to the dashboard rather than allowing another create.

**3. Make the enquiry read as an enquiry**
- Reword `/join/apply` and its confirmation: this is a request to open a chama; nothing is created yet; the group is set up after approval using the emailed link.
- Application row keeps the proposed chama name, and it is prefilled (not auto-created) in onboarding step 2 so the chair confirms it once.

**4. Approval sends a clearer invitation**
- Approval keeps sending the set-password link, with copy that says "create your account, then set up your chama".
- Rejection/approval states surface on the application list.

**5. Clean up existing data (migration)**
- Delete the 17 chama rows that have no memberships and no invites. Real group data is untouched.
- Add a database guard: a unique constraint preventing the same creator from having two groups with the same name.

## Technical notes

- Files touched: `src/lib/chama.server.ts` (idempotent create + reliable rollback), `src/routes/onboarding.tsx` (submit guard, prefill from application), `src/routes/join/apply.tsx` (enquiry copy), `src/lib/access.functions.ts` / `src/lib/onboarding.server.ts` (approval email copy), plus one migration for cleanup and the uniqueness guard.
- No change to RLS or role/permission model.
