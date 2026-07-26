## Goal

One clear way in: **you can only use the app if an admin (chama chair) added your email, or if your chair application was approved.** Everything else gets removed.

## The two journeys

```text
MEMBER
landing → "Join" → explainer page ("only your chair can add you")
       → Sign in (email+password or Google)
       → email found on a chama's member list  → dashboard
       → email not found                       → "Talk to your admin" page

CHAIR
landing → "Join" → explainer → "I'm a chama chair, apply"
       → short form: full name, phone, email, chama name, county/location
       → "Application received" screen
       → you review it in-app and approve/reject
       → on approval they can sign in and set up their chama
```

## What gets removed

- `/signup` (public self-registration) — deleted. Accounts are only created by invite or approved application.
- `/start` and `/setup` explainer pages — folded into one `/join` page.
- `/app` and `/app/create` gateway pages — chama setup moves onto the dashboard onboarding card, which already exists.
- Invite-code joining (already partly gone) — email-based only.

## What gets built

1. **`/join`** — plain-language page explaining admin-only access, with two actions: "Sign in" and "I'm a chama chair — apply".
2. **`/join/apply`** — the application form (name, phone, email, chama name, location), with validation and a confirmation screen.
3. **`/login`** — the single auth page: email + password, Google sign-in, and a working "Forgot password?" link. Post-login it checks membership and routes accordingly.
4. **`/no-access`** — the friendly blocked page: "We couldn't find <email> on any chama's member list", what to do (ask your chair to add this exact email, or apply as a chair), and a sign-out button.
5. **`/admin/applications`** — owner-only review queue (approve / reject, with the applicant's contact details visible). Approval marks them eligible to create a chama.
6. **Member first sign-in** — a chair adds a member's email; the member signs in with Google or requests a magic link, then sets a password. No accounts pre-created.

## Data reset

- Delete all rows in every app table and all auth accounts **except ephraimcreations254@gmail.com** (kept as the platform owner).
- New tables: `chair_applications` (contact details + status) and `platform_admins` (who can review applications), both with strict access rules.
- Keep existing chama tables; the pending-invite table becomes the sole source of truth for "is this email allowed in".

## Technical notes

- Google sign-in goes through the Lovable OAuth broker (`lovable.auth.signInWithOAuth`) and the Google provider gets enabled the same turn, so first sign-in doesn't error.
- Access checking happens in an authenticated server function (JWT email claim), not in the browser — so it can't be bypassed by editing client state.
- The gate lives in the `_authed` layout: signed in but no membership and not an approved chair → redirect to `/no-access`.
- Row-level security: applications are insert-only for anyone (public form), readable/updatable only by platform admins. Membership lookup stays scoped to `auth.uid()`.
- Password reset keeps the existing `/auth/reset-password` route; I'll verify the recovery-link flow end to end.
- Route deletions require regenerating the route tree; I'll restart the dev server after so Vite doesn't cache the removed modules.

## Risks

- Deleting auth users is irreversible — only your account survives.
- Magic-link and password-reset emails use the default sending setup; if the volume limit bites we can raise it or attach a custom sending domain later.
