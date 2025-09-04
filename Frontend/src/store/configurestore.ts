import { configureStore } from "@reduxjs/toolkit";
import urlsReducer from "./slices/urlsSlice";
import logsReducer from "./slices/logsSlice";
import { loggingMiddleware } from "./loggingMiddleware";

export const store = configureStore({
  reducer: {
    urls: urlsReducer,
    logs: logsReducer
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }).concat(loggingMiddleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
