## 1. Billing page matches website + admin pricing

`src/routes/_authed/billing.tsx` currently hardcodes three plans (Free / Growth / SACCO) that don't match the `pricing_plans` table used by the landing page and `/admin/billing`.

- Load plans from the same source the landing page uses (`listPricingPlans`), so admin edits flow to the chair's billing page automatically.
- Add a small public-safe server function to read the active chama's current subscription (plan, status, renewal date) from `billing_subscriptions`, scoped to a chama the caller belongs to.
- Render: current plan badge on the matching card, real renewal date, and the rest as upgrade options. "Upgrade" opens a contact/help prompt (no payment provider is connected yet).
- Keep the page chairperson-gated as today.

## 2. Documents tab

Remove "Documents" from the sidebar Account section — it currently points at `/help` (duplicate) and the product is records-only, not a document store. Help center stays.

## 3. Help center rewrite (role-aware)

`src/routes/_authed/help.tsx`:
- Replace the FAQ list with answers written per role, and show the reader's own role first (Chairperson / Treasurer / Secretary / Member) using the existing `usePermissions` hook — e.g. "Only the Chairperson adds members and assigns roles", "Treasurer records contributions and loan repayments", "Secretary schedules meetings and files minutes", "Members view records, edit their own profile, reset their own PIN".
- Add a real contact block: support email and admin phone number.
- Make the search box actually filter the FAQ list.

## 4. Collapsed sidebar

In `src/components/AppSidebar.tsx`, when collapsed to the icon rail (48px):
- Center each menu button and let icons shrink to the rail (`size-8` button, 4-unit icon), hide labels and the gap.
- Shrink the header logo tile so it fits the rail instead of overflowing.
- Hide the footer card entirely when collapsed rather than showing a stray tile.

## 5. Notification bell

Remove the hardcoded red "3" badge in `src/components/AppHeader.tsx`. Show a count only when there are real unread notifications for the signed-in user; otherwise a plain bell.

### Technical notes
- New server function file for the chama's billing subscription read, going through `requireSupabaseAuth` with a membership check.
- No schema changes; `billing_subscriptions` and `pricing_plans` already exist.
