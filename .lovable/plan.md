# Fixes + Support tickets + Help centre

## 1. Invites: clear errors and a working delete

- Inviting an email that is **already a member of this chama** now fails with a clear message: "That person is already a member of this chama." The check runs on the server before any invite row is created.
- Inviting an email that already has a **pending invite** says so plainly instead of silently resending.
- The red delete button on a pending invitation revokes the invite and removes the row immediately (the revoke call is refused today when the invite row can't be matched — it will be scoped to the chairperson's chama and the list refreshed after success, with the real error surfaced on failure).

Note on the multi-chama rule: the database already enforces one membership per person per chama (unique user + chama), so the same email can join chama A and B but never twice in the same chama. The new invite check makes that rule visible in the UI instead of failing later.

## 2. Loans: rejection shows as rejected

The reject action already writes `rejected` server-side, so the first step is reproducing the case in your screenshot to confirm whether the click failed silently or the list simply didn't refresh. Then:
- Show the server's real error in a toast when a decision fails instead of a generic message.
- Refresh the loan list from the server after every decision so the badge flips to "Rejected" and the action column shows "Decided".

## 3. Activity log actually shows entries

Confirmed cause: the `transparency_logs` table has **no read permission granted to signed-in users**, so the page always renders "No changes recorded yet" even though log rows exist. Fix:
- Grant read access to signed-in users (the existing rule already limits rows to your own chama's logs).
- Confirm investments, deductions, contributions, loans and repayments all write a log entry on create and edit; add the missing ones.

## 4. Help centre + support tickets

Members side (`/help`):
- Keep the FAQ, and add a **"Contact support"** form: subject, category (Account, Payments/Billing, Loans, Technical, Other), description, optional screenshot-free text only.
- Below it, **"My tickets"**: each ticket with its status (Open / In progress / Resolved) and the admin's reply once answered.

Admin side (`/admin/tickets`):
- New tab in the admin sidebar with an unread/open badge count, matching the existing Messages/Newsletter tabs.
- List of tickets with requester, chama, category, age and status; opening one shows the full description, lets the admin write a reply and set the status. Saving a reply notifies the member (bell notification) and shows the reply on their ticket.

## 5. Header

- Show the chama name as plain text with the member's role beneath it, instead of the switcher-styled button, and keep the switcher only when the person belongs to more than one chama.
- Remove the "Create a new chama" link from the header menu.

## Technical notes

- Migration: `GRANT SELECT ON public.transparency_logs TO authenticated`; new `support_tickets` table (user_id, chama_id, subject, category, body, status, admin_reply, replied_at, replied_by) with grants, RLS so a member reads/creates only their own tickets and platform admins read/update all.
- Server functions: `createTicket` / `listMyTickets` in a new `src/lib/support.functions.ts`; admin listing and reply in `src/lib/admin.functions.ts`. Duplicate-member and duplicate-invite guards added to `inviteMember`, and `revokeInvite` scoped + verified in `src/lib/invites.functions.ts`.
- UI: `src/routes/_authed/help.tsx`, new `src/routes/admin/tickets.tsx`, `src/routes/admin.tsx` nav + badge, `src/components/AppHeader.tsx`, `src/routes/_authed/members.tsx`, `src/routes/_authed/loans.tsx`.
