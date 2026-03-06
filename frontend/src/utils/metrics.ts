const IMPACT_LABELS: Record<number, string> = {
  1: "Very Low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very High",
};

export function formatImpact(value: number | null): string {
  return value != null ? (IMPACT_LABELS[value] ?? `${value}`) : "";
}

export function formatEffort(value: number | null): string {
  return value != null ? `${value} pts` : "";
}
