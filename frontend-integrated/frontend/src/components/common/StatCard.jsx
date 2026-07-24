import Card from './Card'

export default function StatCard({ icon: Icon, label, value, trend, tone = 'blue' }) {
  const isDown = typeof trend === 'string' && trend.trim().startsWith('-')
  return (
    <Card className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={18} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trend && <div className={`stat-trend ${isDown ? 'down' : 'up'}`}>{trend}</div>}
    </Card>
  )
}
