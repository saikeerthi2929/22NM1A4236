export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
}

export function isPositiveIntegerString(s: string | undefined): boolean {
  if (!s?.trim()) return true; // optional OK (defaults to 30)
  return /^[0-9]+$/.test(s) && Number(s) > 0;
}
