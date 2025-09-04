import { getAllLinks } from './storage'

export function isValidShortcode(s) {
  if (typeof s !== 'string') return false
  return /^[A-Za-z0-9_-]{4,12}$/.test(s)
}

export function genShortcode(len = 6) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  let out = ''
  for (let i = 0; i < arr.length; i++) {
    out += alphabet[arr[i] % alphabet.length]
  }
  return out
}

export function genUniqueShortcode() {
  const links = getAllLinks()
  let tries = 0
  let code = null
  do {
    code = genShortcode(6)
    tries += 1
    if (tries > 20) throw new Error('unable to generate unique shortcode')
  } while (links[code])
  return code
}

export function isValidUrl(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch  { return false }
}

export const DEFAULT_VALIDITY_MIN = 30

export function nowIso() { return new Date().toISOString() }
