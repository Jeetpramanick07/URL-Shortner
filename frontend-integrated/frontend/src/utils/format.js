// Small formatting helpers shared across pages.

export function formatNumber(value) {
  const number = Number(value || 0)
  return number.toLocaleString()
}

export function formatDate(value, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, options)
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.data || []
}

export function truncate(text, length = 22) {
  if (!text) return text
  return text.length > length ? `${text.slice(0, length)}…` : text
}
