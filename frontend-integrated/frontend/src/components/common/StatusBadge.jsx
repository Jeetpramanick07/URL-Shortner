const TONE = {
  active: 'success',
  human: 'success',
  connected: 'success',
  disabled: 'muted',
  expired: 'danger',
  bot: 'warning',
  preview: 'info',
  failed: 'danger',
  unknown: 'muted',
}

export default function StatusBadge({ value }) {
  const normalized = String(value || 'unknown').toLowerCase()
  const tone = TONE[normalized] || 'muted'
  return <span className={`badge badge-${tone}`}>{normalized}</span>
}
