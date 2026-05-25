## Chama-OS — Public Landing + Invite-First Onboarding

Most of the multi-tenant foundation already exists (chamas, memberships, RLS per chama, role-gated nav, chama switcher, Google sign-in). This round closes the gaps in the **public surface + onboarding loop** you described.

---

### 1. Public landing (`/`)

Refit the existing landing into a clearer funnel:

- **Hero CTA**: primary "Create my Chama" → `/login?intent=create`, secondary "Sign in" → `/login`
- **How it works strip** (3 steps): *Chair creates the chama → Chair invites members by email & assigns roles → Members sign in with Google and see only their chama*
- Keep existing problem/solution/features sections
- Footer CTA repeats "Create my Chama"

Public route, no auth. Keep current `head()` SEO.

---

### 2. Login: Google-only + "not in system" guidance

`/login` already does Google. Add:

- Read `?intent=create|join` from search params. After sign-in:
  - `intent=create` → always go to `/app/create`
  - `intent=join`   → always go to `/app/join`
  - no intent       → `/app` (router decides based on memberships)
- On `/app`, if the signed-in user has **0 memberships AND no intent**, show a friendly "We couldn't find you in any chama" screen with:
  - "Create a new chama" button
  - "Join with an invite code" button
  - Help text: *"Make sure you signed in with the same email your chairperson invited. If not, contact your admin."*
- Keep the existing "Create / Join" cards for the explicit intent paths.

---

### 3. Email invitations (new)

Replace "share an invite code" as the primary path with **email invites**, while keeping the code as a fallback.

**New table `chama_invites`** (migration):
- `id`, `chama_id`, `email` (lowercased), `role` (app_role), `invited_by`, `status` ('pending'|'accepted'|'revoked'), `token` (random), `created_at`, `accepted_at`
- RLS: chair can insert/select/update for their chama; any authed user can `select` rows where `email = auth.jwt() ->> 'email'` (so they can see their own pending invites).

**Server functions** (`src/lib/invites.functions.ts`):
- `inviteMember({ chamaId, email, role })` — chair only, inserts pending invite
- `listMyInvites()` — returns pending invites for current user's email
- `acceptInvite({ inviteId })` — creates `memberships` row with the assigned role, marks invite accepted
- `listChamaInvites({ chamaId })` — chair view
- `revokeInvite({ inviteId })` — chair only

**Auto-accept on sign-in**: when `/app` loads, call `listMyInvites()`; if any pending, auto-accept them all server-side, then continue. This gives the seamless "invited by email → just sign in" experience.

**Email delivery**: out of scope this round (no SMTP secret yet). Chair sees the invite in the chama members list with a "Copy invite link" button (`/login?invite=<token>`); we'll wire real email send in a follow-up once a provider is chosen. I'll call this out clearly in the UI.

---

### 4. Empty-state dashboard for new chair

When the chair lands on `/dashboard` with **0 members besides themselves and no contributions**, show a focused onboarding card instead of empty KPIs:

- "Your chama is ready. Next step: invite your members."
- Primary button → `/members` with the invite dialog open
- Secondary: "Share invite code" (existing flow)

Real KPIs render once data exists.

---

### 5. Members page becomes the chair's control center

`/members` (chair only — others see read-only list):
- Top: **"Invite member by email"** form (email + role select) → `inviteMember`
- Pending invites list with role badge and "Revoke" / "Copy link"
- Active members list with role dropdown (already planned) → `setMemberRole`

---

### Out of scope this round
- Actual SMTP/email sending (need provider choice + secret)
- Notifications fan-out to "respective registered members" (DB already supports it; UI/server-fn for creating notifications on key events is a separate round)
- Per-chama chat (feed exists; threaded chat is a later round)

---

### Files

**New**
- `src/lib/invites.functions.ts`
- `src/components/InviteMemberDialog.tsx`
- Migration: `chama_invites` table + RLS

**Edited**
- `src/routes/index.tsx` — tighten CTAs + how-it-works
- `src/routes/login.tsx` — read `?intent`, pass through
- `src/routes/app.tsx` — handle 0-membership "not found" screen, auto-accept invites
- `src/routes/_app/dashboard.tsx` — empty-state card for fresh chair
- `src/routes/_app/members.tsx` — invite form + pending invites list

Confirm and I'll build it end-to-end.
