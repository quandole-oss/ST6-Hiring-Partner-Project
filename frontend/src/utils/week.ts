export function getCurrentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return formatDate(monday);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Returns an array of Monday date strings going back `count` weeks from the current week. */
export function getRecentMondays(count = 12): string[] {
  const mondays: string[] = [];
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const current = new Date(d);
  current.setDate(diff);

  for (let i = 0; i < count; i++) {
    const monday = new Date(current);
    monday.setDate(current.getDate() - i * 7);
    mondays.push(formatDate(monday));
  }
  return mondays;
}
