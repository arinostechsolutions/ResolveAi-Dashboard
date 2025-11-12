export function formatStatusLabel(status: string | null | undefined) {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}

export function normalizeStatusValue(status: string) {
  return status.trim();
}

