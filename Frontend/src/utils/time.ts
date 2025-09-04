export const nowUnixMs = () => Date.now();
export const addMinutes = (ts: number, minutes: number) => ts + minutes * 60_000;
export const isExpired = (expiresAt: number) => Date.now() > expiresAt;

export function fmt(ts: number) {
  const d = new Date(ts);
  return d.toLocaleString();
}

export function remainingStr(expiresAt: number) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return "expired";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}
