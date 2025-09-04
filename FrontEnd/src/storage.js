
const LINKS_KEY = 'us_links_v1'

function _read() {
  try {
    const raw = localStorage.getItem(LINKS_KEY)
    return raw ? JSON.parse(raw) : { links: {} }
  } catch  {
    return { links: {} }
  }
}

function _write(obj) {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(obj))
    return true
  } catch  {
    return false
  }
}

export function getAllLinks() {
  const d = _read();
  return d.links || {}
}

export function getLink(code) {
  const links = getAllLinks();
  return links[code] || null
}

export function saveLink(code, payload) {
  const d = _read();
  d.links = d.links || {}
  d.links[code] = payload
  return _write(d)
}

export function updateLink(code, changes) {
  const d = _read();
  d.links = d.links || {}
  if (!d.links[code]) return false
  d.links[code] = { ...d.links[code], ...changes }
  return _write(d)
}

export function removeLink(code) {
  const d = _read();
  if (!d.links) return false
  delete d.links[code]
  return _write(d)
}
