export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function personName(person?: string): string {
  if (!person) return "";
  return person.split("(")[0].trim();
}

export function personMeta(person?: string): string {
  if (!person) return "";
  const m = person.match(/\(([^)]+)\)/);
  return m ? m[1] : "";
}

export function initials(name: string): string {
  const clean = name.split("(")[0].trim();
  return clean.slice(0, 1);
}

export function metricLevel(m: string): number {
  return { "◎": 4, "○": 3, "△": 2, X: 1, "-": 0 }[m] ?? 0;
}
