/** Maps a notification `kind` to the tab it should open. */
export function routeForKind(kind: string): string {
  switch ((kind || "").toLowerCase()) {
    case "loan":
    case "loans":
      return "/loans";
    case "contribution":
    case "contributions":
    case "finance":
      return "/contributions";
    case "deduction":
    case "deductions":
      return "/deductions";
    case "report":
    case "reports":
      return "/reports";
    case "meeting":
    case "meetings":
      return "/meetings";
    case "announce":
    case "announcement":
    case "feed":
      return "/feed";
    default:
      return "/notifications";
  }
}

export const NOTIFICATION_FILTERS = [
  { value: "all", label: "All", kinds: [] as string[] },
  { value: "loans", label: "Loans", kinds: ["loan", "loans"] },
  { value: "finance", label: "Finance", kinds: ["contribution", "contributions", "finance", "deduction", "deductions", "report", "reports"] },
  { value: "meetings", label: "Meetings", kinds: ["meeting", "meetings"] },
  { value: "announcements", label: "Announcements", kinds: ["announce", "announcement", "feed"] },
];

export function matchesFilter(kind: string, filter: string) {
  if (filter === "all") return true;
  const f = NOTIFICATION_FILTERS.find((x) => x.value === filter);
  if (!f) return true;
  return f.kinds.includes((kind || "").toLowerCase());
}
