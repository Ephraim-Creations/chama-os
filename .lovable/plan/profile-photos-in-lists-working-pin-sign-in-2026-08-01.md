# Profile photos in lists + working PIN sign-in

Two fixes: show real member photos instead of letter circles, and make the PIN you set in Settings actually work at sign-in.

## 1. PIN sign-in is broken at the database level

Confirmed: the `user_pins` table currently has **no permissions granted to any role** — not even the trusted server role — and the table holds **zero rows**. So every "Set PIN" press fails server-side, nothing is saved, and PIN sign-in can never match.

Fix:
- New migration granting the trusted server role full access to `user_pins` (`GRANT ALL ON public.user_pins TO service_role`), keeping the table unreadable to `anon`/`authenticated` (it is only ever touched by trusted server code). Row-level security stays on with no client policies.
- After the grant, re-verify by setting a PIN and confirming a row appears, then signing in with it.
- Surface the real error in Settings if saving still fails, instead of a generic message, so a silent failure can't happen again.
- Also verify the sign-in exchange: the PIN check issues a one-time token that the browser redeems for a session. If the redeem step rejects the token type, correct it so PIN sign-in lands on the dashboard.

## 2. Show profile pictures instead of "R" letter circles

Member photos are already stored (private `avatars` bucket) and the member list data already carries each member's photo path — the UI just never renders it.

- Add a small reusable avatar component that turns a stored photo path into a temporary viewable link (the same signed-link approach already used on the Settings photo uploader), falling back to initials when a member has no photo.
- Use it in the members list, the app header account button, and the member detail view so photos appear everywhere a person is shown.
- Signed links are fetched in one batch per list to avoid one request per row.

## Technical notes

- Migration: grants on `public.user_pins` for `service_role` only.
- New `src/components/UserAvatar.tsx` wrapping `Avatar`/`AvatarImage` with signed-URL resolution (extracted from `AvatarUploader`'s `useAvatarPreview`).
- Touched: `src/routes/_authed/members.tsx`, `src/components/AppHeader.tsx`, `src/routes/_authed/member.tsx`, `src/routes/_authed/settings.tsx`, `src/lib/pins.server.ts` (error surfacing), `src/routes/login.tsx` (token redeem) as needed.
