import { Loader2 } from 'lucide-react'

export default function Loader({ label = 'Loading…', inline = false }) {
  if (inline) return <span className="loader-inline"><Loader2 size={15} className="spin" /> {label}</span>
  return (
    <div className="loading-state">
      <Loader2 size={22} className="spin" />
      <span>{label}</span>
    </div>
  )
}
