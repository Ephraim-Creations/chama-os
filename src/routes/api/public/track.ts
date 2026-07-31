import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const TRACKED_PATHS = ["/", "/pricing", "/about", "/contact", "/terms", "/privacy", "/join"];

const bodySchema = z.object({
  path: z.string().trim().min(1).max(200),
  referrer: z.string().trim().max(500).nullable().optional(),
  visitorId: z.string().trim().max(64).nullable().optional(),
  sessionId: z.string().trim().max(64).nullable().optional(),
});

function deviceTypeFrom(ua: string): "mobile" | "tablet" | "desktop" {
  const s = ua.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/.test(s)) return "mobile";
  return "desktop";
}

function browserFrom(ua: string): string {
  const s = ua.toLowerCase();
  if (s.includes("edg/")) return "Edge";
  if (s.includes("opr/") || s.includes("opera")) return "Opera";
  if (s.includes("firefox")) return "Firefox";
  if (s.includes("chrome") || s.includes("crios")) return "Chrome";
  if (s.includes("safari")) return "Safari";
  return "Other";
}

/** Host only — query strings can carry sensitive values, so they are dropped. */
function normaliseReferrer(raw: string | null | undefined, selfHost: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.host === selfHost) return null; // internal navigation is not a referrer
    return url.host.replace(/^www\./, "").slice(0, 120);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/public/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed: z.infer<typeof bodySchema>;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const path = parsed.path.split("?")[0].split("#")[0].replace(/(.)\/$/, "$1");
        if (!TRACKED_PATHS.includes(path)) {
          return new Response(null, { status: 204 });
        }

        // Consent is read from the first-party cookie on the server, never trusted
        // from the request body.
        const cookieHeader = request.headers.get("cookie") ?? "";
        const consented = /(?:^|;\s*)chama_consent=all(?:;|$)/.test(cookieHeader);

        const ua = request.headers.get("user-agent") ?? "";
        const selfHost = new URL(request.url).host;

        const row = {
          path,
          referrer: normaliseReferrer(parsed.referrer, selfHost),
          device_type: deviceTypeFrom(ua),
          browser: browserFrom(ua),
          country:
            request.headers.get("cf-ipcountry") ??
            request.headers.get("x-vercel-ip-country") ??
            null,
          visitor_id: consented ? (parsed.visitorId ?? null) : null,
          session_id: consented ? (parsed.sessionId ?? null) : null,
          consented,
        };

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("page_views").insert(row);
          if (error) console.error("[track] insert failed", error.message);
        } catch (err) {
          console.error("[track] unexpected", err);
        }

        return new Response(null, { status: 204 });
      },
    },
  },
});
