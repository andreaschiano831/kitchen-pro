export type ExpiryLevel = "expired" | "h24" | "h72" | "ok" | "none";

export function hoursUntil(iso?: string): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((t - Date.now()) / (1000 * 60 * 60));
}

export function expiryLevel(iso?: string): ExpiryLevel {
  const h = hoursUntil(iso);
  if (h === null) return "none";
  if (h <= 0) return "expired";
  if (h <= 24) return "h24";
  if (h <= 72) return "h72";
  return "ok";
}

export function expiryLabel(level: ExpiryLevel) {
  if (level === "expired") return "SCADUTO/OGGI";
  if (level === "h24") return "<24h";
  if (level === "h72") return "<72h";
  return "";
}

export function expiryClass(level: ExpiryLevel) {
  if (level === "expired" || level === "h24") return "badge badge-expired";
  if (level === "h72") return "badge badge-urgent";
  return "badge";
}

export function isUrgent(level: ExpiryLevel) {
  return level === "expired" || level === "h24" || level === "h72";
}
