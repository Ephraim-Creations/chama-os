# Admin dashboard: badge counts on every tab

Add a small number badge to each tab in the platform admin nav so you can see at a glance where new activity is waiting — new contact messages, new newsletter signups, pending applications, billing problems, and new groups.

## What each badge counts

| Tab | Badge shows |
| --- | --- |
| Overview | no badge |
| Groups | chamas created since you last opened the Groups tab |
| Applications | chair applications still pending review |
| Pricing | no badge |
| Billing | subscriptions that are `past_due` or `cancelled` (needs attention) |
| Announcements | no badge |
| Messages | unread contact messages (`is_read = false`) |
| Newsletter | subscribers added since you last opened the Newsletter tab |
| Analytics | no badge |

Badge styling: small pill on the right of the label, primary green for informational counts (Groups, Applications, Messages, Newsletter) and red for Billing attention items. Hidden entirely when the count is 0, capped display at `99+`.

## How "new" is decided

Two mechanisms, chosen per tab:

- **Real state** where the data already has it: Applications (status pending), Messages (`is_read`), Billing (subscription status). These clear when you actually action the item, not merely by looking.
- **Last-seen timestamp** for Groups and Newsletter, which have no read flag. When you open that tab, the current time is stored in the browser (`localStorage`, per admin) and the badge counts rows created after it. Opening the tab clears the badge.

## Technical notes

- New server function `getAdminBadgeCounts` in `src/lib/admin.functions.ts`, guarded by `requireSupabaseAuth` + `assertPlatformAdmin`, backed by a `loadBadgeCounts()` helper in `src/lib/admin.server.ts`. It runs count-only queries (`head: true, count: "exact"`) against `chamas`, `chair_applications`, `billing_subscriptions`, `contact_messages`, and `newsletter_subscribers`, and accepts the two client-held "since" timestamps as input.
- New `src/hooks/use-admin-badges.tsx`: fetches counts on mount, refetches every 60s and on route change within `/admin`, exposes `markSeen(tabKey)` which writes the timestamp to `localStorage` and refetches.
- `src/routes/admin.tsx`: nav items gain a `badgeKey`; the layout renders a `NavBadge` next to the label and calls `markSeen` in an effect when the active pathname matches a last-seen-based tab.
- Small presentational `src/components/NavBadge.tsx` using existing semantic tokens (`bg-primary/10 text-primary`, `bg-destructive/10 text-destructive`) — no hardcoded colors.
- No database migration required; all counts come from existing tables.
