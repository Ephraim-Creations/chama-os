import { useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  analyticsAllowed,
  getAnalyticsIdentity,
  isTrackablePath,
  normalisePath,
  onConsentChange,
  readConsent,
  setConsent,
} from "@/lib/consent";

/** Opens the cookie settings dialog from anywhere (e.g. the footer link). */
export const COOKIE_SETTINGS_EVENT = "chama:open-cookie-settings";

export function openCookieSettings() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
  }
}

function sendPageView(path: string) {
  const { visitorId, sessionId } = getAnalyticsIdentity();
  const referrer = typeof document !== "undefined" ? document.referrer || null : null;
  void fetch("/api/public/track", {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, referrer, visitorId, sessionId }),
  }).catch(() => {
    /* analytics must never break the page */
  });
}

export function CookieConsent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [hydrated, setHydrated] = useState(false);
  const [decision, setDecision] = useState<"all" | "essential" | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const lastTracked = useRef<string | null>(null);

  const isPublic = isTrackablePath(pathname);

  useEffect(() => {
    setHydrated(true);
    setDecision(readConsent());
    const off = onConsentChange((value) => setDecision(value));
    const open = () => {
      setDraftAnalytics(analyticsAllowed());
      setSettingsOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => {
      off();
      window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
    };
  }, []);

  // Exactly one page view per public navigation, regardless of consent state.
  useEffect(() => {
    if (!hydrated) return;
    const path = normalisePath(pathname);
    if (!isTrackablePath(path)) return;
    if (lastTracked.current === path) return;
    lastTracked.current = path;
    sendPageView(path);
  }, [hydrated, pathname, decision]);

  const choose = useCallback((value: "all" | "essential") => {
    setConsent(value);
    setDecision(value);
  }, []);

  if (!hydrated || !isPublic) return null;

  return (
    <>
      {decision === null && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="flex gap-3">
              <Cookie className="mt-0.5 hidden h-5 w-5 shrink-0 text-primary sm:block" />
              <div>
                <p className="text-sm font-semibold text-foreground">We use cookies</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  We use essential cookies to keep Chama-OS working and optional analytics cookies to
                  understand how people use our public website. You can change your preferences at any
                  time.{" "}
                  <a href="/privacy" className="font-medium text-primary hover:underline">
                    Read our Privacy Policy
                  </a>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:shrink-0">
              <Button
                onClick={() => choose("all")}
                className="h-10 flex-1 rounded-xl px-5 font-semibold md:flex-none"
              >
                Accept all
              </Button>
              <Button
                variant="outline"
                onClick={() => choose("essential")}
                className="h-10 flex-1 rounded-xl px-5 font-semibold md:flex-none"
              >
                Reject non-essential
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setDraftAnalytics(analyticsAllowed());
                  setSettingsOpen(true);
                }}
                className="h-10 w-full rounded-xl px-4 font-medium md:w-auto"
              >
                Cookie settings
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie settings</DialogTitle>
            <DialogDescription>
              Choose which cookies Chama-OS may use on this website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Essential cookies</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Always active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    These cookies are required for security, authentication, consent preferences, and
                    core website functionality.
                  </p>
                </div>
                <Switch checked disabled aria-label="Essential cookies are always active" />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <label
                    htmlFor="analytics-consent"
                    className="text-sm font-semibold text-foreground"
                  >
                    Analytics cookies
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Allow us to measure visits and understand which public pages are useful. Analytics
                    are first-party and do not store your IP address.
                  </p>
                </div>
                <Switch
                  id="analytics-consent"
                  checked={draftAnalytics}
                  onCheckedChange={setDraftAnalytics}
                  aria-label="Allow analytics cookies"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setSettingsOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => {
                choose(draftAnalytics ? "all" : "essential");
                setSettingsOpen(false);
              }}
              className="rounded-xl font-semibold"
            >
              Save preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
