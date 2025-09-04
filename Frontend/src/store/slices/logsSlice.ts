import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { load, save } from "@utils/storage";

export interface LogEntry {
  type: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  meta?: Record<string, unknown>;
}
interface LogsState { entries: LogEntry[]; }
const initialState: LogsState = load<LogsState>("logs_v1") ?? { entries: [] };

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    addLog(state, action: PayloadAction<LogEntry>) {
      state.entries.unshift(action.payload);
      save("logs_v1", state);
    },
    clearLogs(state) {
      state.entries = [];
      save("logs_v1", state);
    }
  }
});

export const { addLog, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
