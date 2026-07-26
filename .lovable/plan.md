# Admin control, email onboarding and PIN sign-in

Three connected pieces: a group-only admin console, real onboarding emails, and a fast email+PIN sign-in inspired by the POS touch panel (our own layout and branding — the POS sidebar is reference only).

## 1. Admin console at /admin — groups, not people

Privacy rule applied throughout: the platform admin sees each chama as a single unit. No member names, no member emails, no per-member figures anywhere in /admin.

Changes:
- **Overview**: remove the "Members" and money-total cards (those aggregate member data). Keep groups count, pending applications, plans, and add plan-mix and new-groups-this-month counts.
- **Chamas tab → group cards/table**: group name, type, location, created date, member *count* only, current plan, status (active / suspended). Search + filter by plan and status. No drill-down into member records.
- **Plans & billing (new focus)**: assign a pricing plan to any group directly from the group row — a plan dropdown writing to `billing_subscriptions`, with status (active, trialing, past_due, cancelled) and renewal date. A "Billing" tab lists every group's subscription with plan changes applied instantly.
- **Suspend / reactivate a group**: blocks sign-in for that group's members, shown as a status badge.
- **Applications**: unchanged review queue, but approving now fires the onboarding email (below).
- Keep the existing top-nav admin layout, restyled for density: Overview · Groups · Applications · Plans · Billing · Announcements.

## 2. Onboarding emails (built-in sender)

Using the built-in default sender now; branded sender can be added later once a domain is set up.

- **Chair approval**: approving an application creates the auth account (if new) and emails an invitation link. The chair clicks it, lands on a "Set your password" page, then goes straight to creating their chama.
- **Member invite**: when a chair adds a member email on the Members page, that person immediately receives the same set-password invitation. Accepting the link confirms the email, sets the password, and auto-joins them to the chama through the existing pending-invite conversion.
- **Resend / copy link** buttons for both, so nobody is stuck waiting on an email.
- A single `/set-password` page handles both invite and recovery links, then routes to the PIN setup step.

## 3. Email + PIN sign-in

- After setting a password, the user is prompted to create a 4-digit PIN (skippable, changeable later in Profile).
- **Login page** gets two tabs: **PIN** (email + touch keypad) and **Password** — same visual language as the rest of Chama-OS, dark-mode aware.
- **Security**: the PIN is never stored in plain form — it is salted and hashed server-side, verified only on the server, and never checked in the browser. Because 4 digits are weak on their own, sign-in enforces: max 5 attempts, then a 15-minute lock on that account; attempts are throttled per IP; every failed and successful PIN sign-in is written to the transparency log. Users can always fall back to password or the emailed one-time link.
- **Users tab in the chairperson's app** (not /admin): the chair sees their members' invite status and can reset a member's PIN — they can never view it.

## Technical notes

- New table `user_pins` (user_id, pin_hash, salt, failed_attempts, locked_until) with self-only RLS; hashing and verification live in a server function using Web Crypto PBKDF2.
- PIN sign-in server function verifies the hash, then mints a one-time sign-in token via the admin auth API; the browser exchanges it for a session. No password or PIN ever crosses the wire in a reusable form.
- `chama_status` column on `chamas` (active/suspended) plus `billing_subscriptions` gains `status` and `renews_at`.
- Onboarding emails use the auth invite/recovery links from the admin auth API, sent server-side from the approval and invite server functions.
- Admin server functions are re-scoped so no member-identifying column is ever selected for the platform admin.
