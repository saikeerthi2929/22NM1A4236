// small local-only "API" shim that uses storage + logger middleware
import { getLink, saveLink, getAllLinks, updateLink } from './storage'
import { genUniqueShortcode, isValidShortcode, isValidUrl, DEFAULT_VALIDITY_MIN, nowIso } from './utils'
import { logEvent } from './loggerMiddleware'

export async function shortenBatch(items) {
  // items: [{ url, validityMinutes?, shortcode? }]
  const results = []
  const errors = []
  const all = getAllLinks()

  const batch = items.slice(0,5)
  for (let i = 0; i < batch.length; i++) {
    const it = batch[i]
    if (!it || typeof it.url !== 'string' || !isValidUrl(it.url)) {
      errors.push({ index: i, message: 'invalid URL' })
      continue
    }
    const validity = Number.isInteger(it.validityMinutes) ? it.validityMinutes : DEFAULT_VALIDITY_MIN
    if (!Number.isInteger(validity) || validity <= 0) {
      errors.push({ index: i, message: 'validityMinutes must be a positive integer' })
      continue
    }

    let code = null
    if (it.shortcode) {
      if (!isValidShortcode(it.shortcode)) {
        errors.push({ index: i, message: 'invalid custom shortcode' })
        continue
      }
      if (all[it.shortcode]) {
        errors.push({ index: i, message: 'custom shortcode already taken' })
        continue
      }
      code = it.shortcode
    }

    if (!code) {
  try {
    code = genUniqueShortcode()
  } catch {
    errors.push({ index: i, message: 'could not generate unique shortcode' })
    continue
  }
}


    const createdAt = nowIso()
    const expiry = new Date(Date.now() + validity * 60 * 1000).toISOString()

    const payload = { url: it.url, createdAt, expiry, clicks: 0, clicksMeta: [] }
    saveLink(code, payload)
    logEvent('shorten_created', { code, url: it.url, expiry })
    results.push({ url: it.url, shortcode: code, expiry })
  }

  return { results, errors }
}

export async function resolveLocal(code) {
  const link = getLink(code)
  if (!link) return { error: 'not_found' }
  if (new Date(link.expiry) < new Date()) return { error: 'expired' }
  return { url: link.url }
}

export async function recordClick(code, clickMeta) {
  const link = getLink(code)
  if (!link) return false
  link.clicks = (link.clicks || 0) + 1
  link.clicksMeta = link.clicksMeta || []
  link.clicksMeta.push(clickMeta)
  updateLink(code, link)
  logEvent('click_recorded', { code, clickMeta })
  return true
}

export async function fetchStats() {
  const all = getAllLinks()
  const arr = Object.keys(all).map(k => ({ code: k, ...all[k] }))
  return arr
}
