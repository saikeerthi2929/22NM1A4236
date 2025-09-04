import { createSlice, PayloadAction, nanoid } from "@reduxjs/toolkit";
import { load, save } from "@utils/storage";
import { ensureUniqueOrThrow, generateShortcode, isValidShortcode } from "@utils/shortcode";
import { nowUnixMs, addMinutes, isExpired } from "@utils/time";

export interface ClickEvent {
  id: string;
  timestamp: number;
  source: string;        // e.g., "result-page", "stats-page", "direct", "external"
  location?: string;     // coarse location string if available
}
export interface ShortUrl {
  id: string;
  code: string;          // the shortcode
  longUrl: string;
  createdAt: number;
  expiresAt: number;     // unix ms
  clicks: number;
  events: ClickEvent[];
}

interface CreateRequest {
  longUrl: string;
  validityMinutes?: number; // default 30
  preferredCode?: string;
}
interface CreateResult {
  ok: boolean;
  item?: ShortUrl;
  error?: string;
}

interface UrlsState {
  items: ShortUrl[];
}

const initialState: UrlsState = load<UrlsState>("urls_v1") ?? { items: [] };

const urlsSlice = createSlice({
  name: "urls",
  initialState,
  reducers: {
    createMany(state, action: PayloadAction<CreateRequest[]>) {
      const results: CreateResult[] = [];
      const existingCodes = new Set(state.items.map(i => i.code));

      for (const req of action.payload.slice(0, 5)) {
        // Validate URL
        try {
          const u = new URL(req.longUrl);
          if (!["http:", "https:"].includes(u.protocol)) throw new Error("Invalid URL protocol");
        } catch {
          results.push({ ok: false, error: "Invalid URL format" });
          continue;
        }

        // Validity
        const minutes = (Number.isInteger(req.validityMinutes) ? req.validityMinutes : undefined) ?? 30;
        if (typeof minutes !== "number" || !Number.isFinite(minutes) || minutes <= 0) {
          results.push({ ok: false, error: "Validity must be a positive integer (minutes)" });
          continue;
        }

        // Shortcode (preferred or auto)
        let code: string;
        if (req.preferredCode && req.preferredCode.trim().length > 0) {
          if (!isValidShortcode(req.preferredCode)) {
            results.push({ ok: false, error: "Preferred shortcode must be alphanumeric (4-20 chars)" });
            continue;
          }
          try {
            code = ensureUniqueOrThrow(req.preferredCode, existingCodes);
          } catch {
            results.push({ ok: false, error: "Preferred shortcode is already in use" });
            continue;
          }
        } else {
          code = generateShortcode(existingCodes);
        }
        existingCodes.add(code);

        const createdAt = nowUnixMs();
        const expiresAt = addMinutes(createdAt, minutes);

        const item: ShortUrl = {
          id: nanoid(),
          code,
          longUrl: req.longUrl,
          createdAt,
          expiresAt,
          clicks: 0,
          events: []
        };
        state.items.unshift(item);
        results.push({ ok: true, item });
      }

      save("urls_v1", state);
      // Expose results on action.meta? Not necessary—UI re-derives from state.
      (action as any).results = results;
    },

    recordClick(state, action: PayloadAction<{ code: string; event: Omit<ClickEvent, "id"> }>) {
      const found = state.items.find(i => i.code === action.payload.code);
      if (!found) return;
      // Don't count clicks after expiry
      if (isExpired(found.expiresAt)) return;

      found.clicks += 1;
      found.events.unshift({ id: nanoid(), ...action.payload.event });
      save("urls_v1", state);
    },

    purgeExpired(state) {
      state.items = state.items.filter(i => !isExpired(i.expiresAt));
      save("urls_v1", state);
    }
  }
});

export const { createMany, recordClick, purgeExpired } = urlsSlice.actions;
export default urlsSlice.reducer;
export type { CreateRequest, CreateResult };
