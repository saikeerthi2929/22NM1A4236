const ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function isValidShortcode(code: string): boolean {
  return /^[A-Za-z0-9]{4,20}$/.test(code);
}

function randomCode(len = 7) {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
  }
  return out;
}

export function ensureUniqueOrThrow(code: string, existing: Set<string>): string {
  if (existing.has(code)) throw new Error("duplicate");
  return code;
}

export function generateShortcode(existing: Set<string>): string {
  // Try up to 5 randoms at length 7, then grow length.
  let len = 7;
  for (let attempts = 0; attempts < 20; attempts++) {
    const c = randomCode(len);
    if (!existing.has(c)) return c;
    if (attempts % 5 === 4) len++;
  }
  // As a last resort, append timestamp fragment (still alphanumeric).
  const fallback = randomCode(6) + Date.now().toString(36);
  if (!existing.has(fallback)) return fallback;
  // Extremely unlikely
  let i = 1;
  while (existing.has(fallback + i)) i++;
  return fallback + i;
}
