import React, { useState } from 'react'
import ShortenForm from '../components/ShortenForm'
import { exportLogs, getLogs, clearLogs } from '../loggerMiddleware'

export default function ShortenerPage() {
  const [results, setResults] = useState([])
  const [errors, setErrors] = useState([])

  async function handleResult(r, e) {
    setResults(r)
    setErrors(e)
  }

  return (
    <div>
      <h2>Create short links (up to 5 at once)</h2>
      <ShortenForm onResult={handleResult} />

      <section>
        <h3>Results</h3>
        {results.length === 0 && <p>No results yet</p>}
        <ul>
          {results.map((it, idx) => (
            <li key={idx}>
              Original: {it.url} — Short: <a href={`/r/${it.shortcode}`}>{location.origin + '/r/' + it.shortcode}</a> — Expires: {new Date(it.expiry).toLocaleString()}
            </li>
          ))}
        </ul>
        {errors.length > 0 && (
          <div>
            <h4>Errors</h4>
            <ul>
              {errors.map((er, i) => <li key={i}>{JSON.stringify(er)}</li>)}
            </ul>
          </div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Logs</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={exportLogs()} download={`us_logs_${new Date().toISOString()}.json`} onClick={() => setTimeout(()=> URL.revokeObjectURL(exportLogs()), 2000)}>Export logs</a>
          <button onClick={() => { clearLogs(); }}>Clear logs</button>
        </div>
        <details>
          <summary>View recent logs</summary>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>{JSON.stringify(getLogs().slice(-50), null, 2)}</pre>
        </details>
      </section>
    </div>
  )
}