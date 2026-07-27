/** Formatting helpers. Real data comes from the database — no demo rows. */
export const ksh = (n: number) =>
  "Ksh " + Math.round(n).toLocaleString("en-KE", { maximumFractionDigits: 0 });

export function initialsOf(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}
