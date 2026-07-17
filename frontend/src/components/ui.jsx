import { LoaderCircle, SearchX } from 'lucide-react'

export function GlassCard({ children, className = '' }) {
  return <section className={`glass-card ${className}`}>{children}</section>
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, trend, tone = 'purple' }) {
  return (
    <GlassCard className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trend && <div className={`stat-trend ${trend.startsWith('-') ? 'down' : ''}`}>{trend}</div>}
    </GlassCard>
  )
}

export function StatusBadge({ value }) {
  const normalized = String(value || 'unknown').toLowerCase()
  return <span className={`status-badge ${normalized}`}>{normalized}</span>
}

export function EmptyState({ title = 'No data yet', message = 'Create your first link to begin collecting analytics.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><SearchX size={28} /></div>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  )
}

export function LoadingState({ label = 'Loading data...' }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={22} /> {label}</div>
}

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  return (
    <div className={`toast ${type}`} role="status">
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  )
}
