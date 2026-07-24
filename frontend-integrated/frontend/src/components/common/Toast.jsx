import { useEffect } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

export default function Toast({ message, type = 'success', onClose, duration = 3200 }) {
  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null
  const Icon = ICONS[type] || Info

  return (
    <div className={`toast toast-${type}`} role="status">
      <Icon size={18} />
      <span>{message}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss"><X size={15} /></button>
    </div>
  )
}
