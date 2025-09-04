import { Middleware } from "@reduxjs/toolkit";
import { addLog } from "./slices/logsSlice";

export const loggingMiddleware: Middleware = (storeApi) => (next) => (action) => {
  const startedAt = Date.now();
  const prevState = storeApi.getState();

  const result = next(action);

  try {
    const endedAt = Date.now();
    // DO NOT use console.*. Persist a structured log entry instead.
    storeApi.dispatch(
      addLog({
        type: action.type,
        startedAt,
        endedAt,
        durationMs: endedAt - startedAt,
        // Keep small snapshot to avoid bloat
        meta: {
          urlCount: prevState?.urls?.items?.length ?? 0
        }
      })
    );
  } catch {
    // Intentionally silent (no console logging permitted)
  }
  return result;
};
