/**
 * First-party cookie consent + analytics identity.
 *
 * Two categories only: essential (always on) and analytics (opt-in).
 * There is no marketing category because the site sets no marketing cookies.
 */

export type ConsentValue = "all" | "essential";

export const CONSENT_COOKIE = "chama_consent";
export const VISITOR_COOKIE = "chama_vid";
export const SESSION_COOKIE = "chama_sid";

const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 182;
const VISITOR_SECONDS = SIX_MONTHS_SECONDS;
const SESSION_SECONDS = 60 * 30; // rolling 30-minute inactivity window

/** Public routes we are allowed to measure. Everything else is never tracked. */
export const TRACKED_PATHS = [
  "/",
  "/pricing",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/join",
] as const;

export function isTrackablePath(path: string): boolean {
  const clean = path.split("?")[0].split("#")[0];
  const normalised = clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return (TRACKED_PATHS as readonly string[]).includes(normalised || "/");
}

export function normalisePath(path: string): string {
  const clean = path.split("?")[0].split("#")[0];
  const normalised = clean.length > 1 && clean.endsWith("/") ? clean.slice(0, -1) : clean;
  return normalised || "/";
}

/* ------------------------------------------------------------------ cookies */

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/* ------------------------------------------------------------------ consent */

export function readConsent(): ConsentValue | null {
  const raw = readCookie(CONSENT_COOKIE);
  return raw === "all" || raw === "essential" ? raw : null;
}

export function analyticsAllowed(): boolean {
  return readConsent() === "all";
}

const listeners = new Set<(value: ConsentValue) => void>();

export function onConsentChange(fn: (value: ConsentValue) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setConsent(value: ConsentValue) {
  writeCookie(CONSENT_COOKIE, value, SIX_MONTHS_SECONDS);
  if (value === "all") {
    // Fresh identity every time analytics is (re)enabled — no back-attribution.
    if (!readCookie(VISITOR_COOKIE)) writeCookie(VISITOR_COOKIE, randomId(), VISITOR_SECONDS);
  } else {
    clearAnalyticsIds();
  }
  listeners.forEach((fn) => fn(value));
}

export function clearAnalyticsIds() {
  deleteCookie(VISITOR_COOKIE);
  deleteCookie(SESSION_COOKIE);
}

/* ----------------------------------------------------------------- identity */

function randomId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Visitor + session ids, only when analytics consent is active. */
export function getAnalyticsIdentity(): { visitorId: string | null; sessionId: string | null } {
  if (!analyticsAllowed()) return { visitorId: null, sessionId: null };

  let visitorId = readCookie(VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = randomId();
    writeCookie(VISITOR_COOKIE, visitorId, VISITOR_SECONDS);
  }

  let sessionId = readCookie(SESSION_COOKIE);
  if (!sessionId) sessionId = randomId();
  // Re-writing on every view keeps the 30-minute inactivity window rolling.
  writeCookie(SESSION_COOKIE, sessionId, SESSION_SECONDS);

  return { visitorId, sessionId };
}
