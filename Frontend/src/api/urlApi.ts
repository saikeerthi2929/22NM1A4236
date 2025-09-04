import type { CreateRequest } from "@store/slices/urlsSlice";


// In a real app, these would be network calls. Here we just expose a typed facade.
// Kept synchronous because persistence is localStorage. If swapped to server, make async.
export const urlApi = {
  createShortUrls(batch: CreateRequest[]) {
    // The reducer will handle validation/uniqueness/defaults.
    return batch;
  }
};
