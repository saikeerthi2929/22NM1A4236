import React, { useEffect, useState } from 'react'
import { fetchStats } from '../apiStub'

export default function StatsPage() {
  const [links, setLinks] = useState([])

  useEffect(() => {
    let mounted = true
    fetchStats().then(arr => { if (mounted) setLinks(arr) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h2>All shortened URLs</h2>
      <ul>
        {links.length === 0 && <li>No links yet</li>}
        {links.map(l => (
          <li key={l.code} style={{ marginBottom: 12 }}>
            <div>Short: <a href={`/r/${l.code}`}>{location.origin + '/r/' + l.code}</a></div>
            <div>Original: {l.url}</div>
            <div>Created: {new Date(l.createdAt).toLocaleString()} — Expires: {new Date(l.expiry).toLocaleString()}</div>
            <div>Clicks: {l.clicks || 0}</div>
            <details>
              <summary>Click details</summary>
              <ul>
                {(l.clicksMeta || []).slice().reverse().map((c, idx) => (
                  <li key={idx}>{c.at} — {c.source} — {formatLocation(c.location)}</li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatLocation(loc) {
  if (!loc) return 'Unknown'
  if (loc === 'Unknown') return 'Unknown'
  if (typeof loc === 'object' && loc.lat != null && loc.lon != null) return `lat:${loc.lat}, lon:${loc.lon}`
  return String(loc)
}