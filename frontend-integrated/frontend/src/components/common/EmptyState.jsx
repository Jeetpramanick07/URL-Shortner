import { SearchX } from 'lucide-react'

export default function EmptyState({
  icon: Icon = SearchX,
  title = 'No data yet',
  message = 'Create your first item to get started.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={26} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}
