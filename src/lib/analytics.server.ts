import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AnalyticsRange = 7 | 30 | 90;

export type AnalyticsSummary = {
  rangeDays: AnalyticsRange;
  totals: {
    views: number;
    uniqueVisitors: number;
    sessions: number;
    viewsPerSession: number;
  };
  daily: Array<{ date: string; views: number }>;
  topPages: Array<{ path: string; views: number }>;
  devices: Array<{ label: string; views: number; percent: number }>;
  browsers: Array<{ label: string; views: number; percent: number }>;
  referrers: Array<{ label: string; views: number }>;
  countries: Array<{ label: string; views: number }>;
  consent: { accepted: number; rejected: number; acceptedPercent: number; rejectedPercent: number };
};

type Row = {
  path: string;
  referrer: string | null;
  device_type: string;
  browser: string;
  country: string | null;
  visitor_id: string | null;
  session_id: string | null;
  consented: boolean;
  created_at: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  KE: "Kenya",
  UG: "Uganda",
  TZ: "Tanzania",
  RW: "Rwanda",
  ET: "Ethiopia",
  NG: "Nigeria",
  ZA: "South Africa",
  GH: "Ghana",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  IN: "India",
  DE: "Germany",
  FR: "France",
  NL: "Netherlands",
  AE: "United Arab Emirates",
  AU: "Australia",
};

function countryName(code: string | null): string {
  if (!code) return "Unknown";
  const upper = code.toUpperCase();
  return COUNTRY_NAMES[upper] ?? upper;
}

function tally<T>(rows: Row[], pick: (row: Row) => T | null): Map<T, number> {
  const map = new Map<T, number>();
  for (const row of rows) {
    const key = pick(row);
    if (key === null) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function sorted(map: Map<string, number>, limit?: number) {
  const list = [...map.entries()]
    .map(([label, views]) => ({ label, views }))
    .sort((a, b) => b.views - a.views);
  return limit ? list.slice(0, limit) : list;
}

function withPercent(list: Array<{ label: string; views: number }>, total: number) {
  return list.map((item) => ({
    ...item,
    percent: total === 0 ? 0 : Math.round((item.views / total) * 100),
  }));
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export async function loadAnalytics(rangeDays: AnalyticsRange): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (rangeDays - 1));

  const { data, error } = await supabaseAdmin
    .from("page_views")
    .select("path, referrer, device_type, browser, country, visitor_id, session_id, consented, created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(100000);

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  const consentedRows = rows.filter((r) => r.consented);
  const uniqueVisitors = new Set(consentedRows.map((r) => r.visitor_id).filter(Boolean)).size;
  const sessions = new Set(consentedRows.map((r) => r.session_id).filter(Boolean)).size;

  // Continuous day axis so the chart never invents or skips points.
  const daily: Array<{ date: string; views: number }> = [];
  const byDay = tally(rows, (r) => dayKey(r.created_at));
  for (let i = 0; i < rangeDays; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    daily.push({ date: key, views: byDay.get(key) ?? 0 });
  }

  const total = rows.length;
  const accepted = consentedRows.length;
  const rejected = total - accepted;

  return {
    rangeDays,
    totals: {
      views: total,
      uniqueVisitors,
      sessions,
      viewsPerSession:
        sessions === 0 ? 0 : Math.round((consentedRows.length / sessions) * 10) / 10,
    },
    daily,
    topPages: sorted(tally(rows, (r) => r.path), 10).map((p) => ({ path: p.label, views: p.views })),
    devices: withPercent(sorted(tally(rows, (r) => r.device_type)), total),
    browsers: withPercent(sorted(tally(rows, (r) => r.browser), 6), total),
    referrers: sorted(tally(rows, (r) => r.referrer ?? "Direct"), 8),
    countries: sorted(tally(rows, (r) => countryName(r.country)), 8),
    consent: {
      accepted,
      rejected,
      acceptedPercent: total === 0 ? 0 : Math.round((accepted / total) * 100),
      rejectedPercent: total === 0 ? 0 : Math.round((rejected / total) * 100),
    },
  };
}
