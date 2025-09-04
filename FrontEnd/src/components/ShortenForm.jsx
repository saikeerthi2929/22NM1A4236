import React, { useState } from 'react'
import { shortenBatch } from '../apiStub'
import { isValidUrl, isValidShortcode } from '../utils'

export default function ShortenForm({ onResult }) {
  const [rows, setRows] = useState([{ url: '', validityMinutes: '', shortcode: '' }])
  const [loading, setLoading] = useState(false)

  function setRow(idx, changes) {
    setRows(prev => prev.map((r,i) => i===idx ? { ...r, ...changes } : r))
  }

  function addRow() {
    if (rows.length >= 5) return
    setRows(prev => [...prev, { url: '', validityMinutes: '', shortcode: '' }])
  }

  function removeRow(i) {
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  async function submit(e) {
    e.preventDefault()
    const items = []
    const errors = []
    rows.forEach((r, idx) => {
      if (!r.url) {
        errors.push({ index: idx, message: 'URL required' })
        return
      }
      if (!isValidUrl(r.url)) {
        errors.push({ index: idx, message: 'Invalid URL format' })
        return
      }
      let validity = undefined
      if (r.validityMinutes) {
        const v = Number(r.validityMinutes)
        if (!Number.isInteger(v) || v <= 0) {
          errors.push({ index: idx, message: 'validityMinutes must be positive integer' })
          return
        }
        validity = v
      }
      if (r.shortcode && !isValidShortcode(r.shortcode)) {
        errors.push({ index: idx, message: 'Invalid shortcode format' })
        return
      }
      const item = { url: r.url }
      if (validity) item.validityMinutes = validity
      if (r.shortcode) item.shortcode = r.shortcode
      items.push(item)
    })

    if (errors.length > 0) {
      onResult([], errors)
      return
    }

    setLoading(true)
    try {
      const body = await shortenBatch(items)
      onResult(body.results || [], body.errors || [])
    }  catch (err) {
  // Log the actual error using middleware
  import("../logger").then(({ log }) => {
    log("error", "ShortenForm.submit failed", { error: String(err) });
  });

  // Show a user-friendly message
  onResult([], [{ message: err?.message || "Unexpected internal error" }]);
}
 finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="shorten-form">
      {rows.map((r, idx) => (
        <div className="row" key={idx}>
          <input placeholder="Long URL" value={r.url} onChange={e => setRow(idx, { url: e.target.value })} />
          <input placeholder="Validity minutes (optional)" value={r.validityMinutes} onChange={e => setRow(idx, { validityMinutes: e.target.value })} />
          <input placeholder="Custom shortcode (optional)" value={r.shortcode} onChange={e => setRow(idx, { shortcode: e.target.value })} />
          <button type="button" onClick={() => removeRow(idx)}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop: 10 }}>
        <button type="button" onClick={addRow} disabled={rows.length >= 5}>Add row</button>
        <button type="submit" disabled={loading}>Shorten</button>
      </div>
    </form>
  )
}