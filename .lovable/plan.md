## Goal

Make the bell a real notification centre, separate **personal** stats from **collective** chama analytics (penalties are not contributions), rename the sidebar entries, and open Settings to every member except the chama setup tab.

---

## 1. Notification centre in the bell

Today the bell is just a link to `/notifications`, and opening that page silently marks everything read.

- Bell becomes a dropdown panel: latest ~8 notifications, unread highlighted, each row showing title, short body and time.
- Each row gets an **Open** action that routes to the tab the notification is about, using its `kind`:
  - `loan`/`loans` → `/loans`, `contribution` → `/contributions`, `deduction` → `/deductions`, `report` → `/reports`, `meeting` → `/meetings`, `announce` → `/feed`, anything else → `/notifications`.
  - Opening a single notification marks just that one read.
- **Mark all as read** button in the panel header and at the top of `/notifications`.
- `/notifications` no longer auto-marks on load; the badge only drops when the user acts. Page keeps a kind filter row (All / Loans / Finance / Meetings / Announcements) and the same Open behaviour per row.

## 2. Penalties are not contributions

In the member's personal figures, penalty rows are currently folded into "savings" and the entry count.

- Personal savings = contributions of type savings/welfare/project/investment, minus withdrawals, minus deductions. **Penalties are excluded** and reported as their own "Penalties paid" figure.
- Collective analytics (dashboard, reports, transparency) keep counting penalties in group income, as they do today — nothing hidden at group level.

## 3. Personal vs collective stats

- **My stats** page (chairperson, treasurer, secretary and member alike) shows only that person's numbers: my savings, penalties paid, deductions, my loan balance and repayment progress, my entries, next meeting. No other member's figures.
- **Overview / dashboard + reports** show the collective picture, extended with:
  - Total loaned out (all active/approved/overdue principal)
  - Total repaid to date
  - Outstanding loan balance
  - **Available to lend** = group savings + investment income held − outstanding loan balance
  - Penalties collected, deductions collected

## 4. Sidebar and naming

- Overview section becomes: **Overview** (`/dashboard`) and, right below it, **My stats** (`/member`).
- The old **Profile** item is removed from the Account section (it pointed at the same page).
- **Settings** is visible to every role; inside Settings the **Chama setup** tab stays chairperson-only (already the case), so members get Profile, Security, Accessibility and Notifications only.

---

## Technical notes

- `src/lib/chama-data.server.ts`: add `penalties` per member, exclude penalties from `savings`; add `totals.loanedOut`, `totals.loanRepaid`, `totals.loanOutstanding`, `totals.availableToLend`, `totals.penaltiesTotal`.
- `src/lib/chama-data.functions.ts`: add `markNotificationRead` (single id, scoped to the caller) alongside the existing `markNotificationsRead`.
- New `src/components/NotificationsBell.tsx` used by `AppHeader`; shared `kind → route` map in a small helper so bell and page agree.
- `src/routes/_authed/notifications.tsx`: drop auto-mark-on-mount, add explicit mark-all + per-row open, add kind filter.
- `src/routes/_authed/member.tsx`: retitle to "My stats", add penalties card and my-loan detail.
- `src/routes/_authed/dashboard.tsx`: add the lending-capacity KPIs.
- `src/components/AppSidebar.tsx`: reorder/rename items, drop the `settings.manage` gate on Settings.
- No database changes needed — penalty is already a contribution type and notifications already carry `kind` and `read_at`.
