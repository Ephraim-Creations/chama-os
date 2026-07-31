## Goal

Add first-party visitor analytics to the `/admin` dashboard, plus a real cookie consent banner on the public site that actually controls whether tracking happens.

## Current state (verified)

There is no analytics code and no consent code anywhere in the project — no tracking table, no banner, no admin analytics tab. Everything below is new.

## What gets built

### 1. Cookie consent banner (public site)

A bottom banner on first visit with three actions: Accept all, Reject non-essential, and a link to the Privacy page. The choice is stored in a first-party cookie (`chama_consent`, 6 months) so it persists across visits and is readable on the server.

- Reject: nothing is tracked beyond a single anonymous, non-identifying page count with no cookie ID.
- Accept: a random visitor ID cookie is set so repeat visits can be grouped into sessions.
- A small "Cookie settings" link in the footer lets people change their mind later.

### 2. Tracking

A page view is recorded on every route change on public pages (landing, pricing, about, contact, terms, privacy, join). Captured per view:

- path and referrer
- device type (mobile / tablet / desktop) and browser, derived from the user agent
- country, from the edge request header when available
- coarse timestamp, visitor ID (only with consent), session ID

No IP address is stored, and nothing is captured inside the signed-in chama app.

### 3. Admin analytics tab

New "Analytics" item in the `/admin` sidebar showing, for a selectable range (7 / 30 / 90 days):

- KPI cards: total views, unique visitors, sessions, average views per session
- A visits-over-time line chart
- Top pages table
- Device-type breakdown (mobile / tablet / desktop)
- Browser breakdown
- Top referrers (which sites send traffic)
- Top countries
- Consent split: how many visitors accepted vs rejected

Empty states everywhere until data accumulates — no fake or seeded numbers.

## Technical section

- Migration creates `public.page_views` (id, path, referrer, device_type, browser, country, visitor_id, session_id, consented, created_at) with GRANTs, RLS on, an insert path restricted to trusted server code, and select limited to platform admins via `is_platform_admin`. Indexes on `created_at` and `path`.
- Ingestion goes through a TanStack server route under `src/routes/api/public/track` so it can be called with `keepalive` and can read the user agent and country header server-side; input validated with Zod, path allow-listed to known public routes, writes via the service-role client.
- Aggregation lives in `src/lib/analytics.server.ts` with admin-guarded server functions in `src/lib/analytics.functions.ts` (same `is_platform_admin` check pattern used by the other admin functions).
- Consent state lives in `src/components/CookieConsent.tsx` plus a small `src/lib/consent.ts` helper; the banner is rendered in `__root.tsx` and gated to public routes. Rendering waits for hydration so it cannot cause a hydration mismatch.
- Charts reuse the existing Recharts setup already used on the dashboard.

## Out of scope

- No Google Analytics / PostHog — this stays first-party so the data shows inside your own admin.
- No tracking of authenticated in-app behaviour.
