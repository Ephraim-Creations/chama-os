## Goal

A real cookie consent system on the public Chama-OS website, plus first-party visitor analytics in the `/admin` dashboard. Consent actually controls tracking — it is not a decorative banner.

## Current state (verified)

No analytics code, no consent code, no tracking table exist in the project today. Everything below is new.

## 1. Consent experience (public site)

**Banner** — fixed to the bottom on first visit, compact on desktop, stacked on mobile, using the existing Chama-OS design tokens.

- Title: "We use cookies"
- Body: essential cookies keep Chama working; optional analytics help us understand the public site; preferences can change any time.
- Actions: **Accept all**, **Reject non-essential**, **Cookie settings**, plus a link to the Privacy Policy.

**Cookie settings** — a dialog with two categories only:

- Essential — always active, toggle disabled, explains security/auth/consent/core function.
- Analytics — off by default, explains first-party measurement with no IP storage.
- Marketing is deliberately absent because the site has no marketing cookies.
- Save preferences / Cancel. Saving applies instantly, no reload.

**Footer link** — "Cookie settings" on every public page reopens the same dialog, so any earlier choice is reversible in both directions.

Accessibility: proper dialog semantics, keyboard navigation, visible focus, labelled controls.

## 2. Consent rules

Stored in a first-party `chama_consent` cookie, 6-month lifetime, readable server-side. Values: `all` (analytics on) or `essential` (analytics off).

- Accept all: create a random visitor ID cookie and a session ID, start tracking.
- Reject: no visitor ID, no session cookie, no cross-visit identification — only a minimal anonymous page count with null identifiers.
- Turning analytics off later: stop sending identified events immediately and delete the analytics cookies. Existing aggregated rows stay.
- Turning analytics on later: brand-new visitor ID and session; earlier anonymous views are never back-attributed.
- Sessions expire after 30 minutes of inactivity — same visitor ID, new session ID.

## 3. Tracking scope

Tracked public routes only: `/`, `/pricing`, `/about`, `/contact`, `/terms`, `/privacy`, `/join`. Never `/admin`, `/dashboard`, `/login`, or any authenticated page. Exactly one event per navigation — no double count on load, refresh, or client-side transition.

Recorded per view: path, referrer, device type, browser, country, visitor ID, session ID, consent flag, timestamp. Never recorded: IP address, email, name, phone, account ID, auth data, or any form or message content.

## 4. Admin analytics

New **Analytics** item in the `/admin` sidebar, platform-admin only, matching the existing admin look.

Range selector: 7 / 30 / 90 days, default 30. Changing it refreshes everything.

- KPI cards: total views, unique visitors (consented only), sessions, average views per session (0 when no sessions — never NaN).
- Visits over time — Recharts line chart, grouped by day, adapting to the range.
- Top pages table, sorted by views.
- Device breakdown (mobile / tablet / desktop) with count and percentage.
- Browser breakdown (Chrome, Safari, Edge, Firefox, Other) — normalized server-side; raw user agents never shown.
- Top referrers, with blank referrers shown as "Direct" and query strings stripped.
- Top countries, using country names, "Unknown" when unavailable.
- Consent split: accepted vs rejected views in the period, labelled so it is not mistaken for a share of people.

Every section has a real empty state ("No visitor data yet…"). No seeded or mock rows anywhere — the dashboard starts at zero.

## 5. Privacy page

Rewritten cookie section covering essential vs optional analytics, first-party only, no IP storage, how to change preferences (with an inline Cookie settings link), and that in-app authenticated behaviour is not tracked. No claim of marketing cookies.

## Technical section

- Migration creates `public.page_views` (id, path, referrer, device_type, browser, country, visitor_id, session_id, consented, created_at) with nullable identifier columns for anonymous traffic, GRANTs, RLS enabled, no client insert path, and admin-only reads via `is_platform_admin`. Indexes on `created_at` and `path`.
- Ingestion: TanStack server route `src/routes/api/public/track`. Body validated with Zod; path checked against the allow-list; device type, browser, country and referrer derived server-side from the user agent and edge headers rather than trusted from the client; writes via the service-role client loaded inside the handler. Client sends only path, referrer, visitor ID, session ID via `fetch` with `keepalive: true`.
- `src/lib/analytics.server.ts` holds aggregation queries; `src/lib/analytics.functions.ts` exposes admin-guarded server functions using the existing platform-admin check. Only aggregates cross the boundary — never raw rows.
- `src/lib/consent.ts` centralizes reading/writing consent, checking whether analytics are allowed, and clearing identifiers.
- `src/components/CookieConsent.tsx` renders the banner and settings dialog, mounted from `__root.tsx`, gated on public routes and on hydration so SSR cannot mismatch or flash.
- Route-change tracking hooks into the router location subscription with a guard against duplicate emissions.

## Out of scope

No Google Analytics, no PostHog, no third-party scripts. No marketing cookie category until an advertising system actually exists. No tracking inside the authenticated app.
