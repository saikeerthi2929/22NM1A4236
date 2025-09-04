// loggerMiddleware: client-side logging "middleware" (no console usage)
// stores structured logs into localStorage under key 'us_logs'

const LOG_KEY = 'us_logs'

function _readLogs() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function _writeLogs(arr) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(arr))
    return true
  } catch (e) {
    return false
  }
}

export function logEvent(eventType, payload = {}) {
  const entry = {
    time: new Date().toISOString(),
    eventType,
    payload
  }
  const logs = _readLogs()
  logs.push(entry)
  _writeLogs(logs)
}

export function getLogs() {
  return _readLogs()
}

export function clearLogs() {
  _writeLogs([])
}

export function exportLogs() {
  const logs = _readLogs()
  const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  return url
}