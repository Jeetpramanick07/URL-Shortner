import { useState } from 'react'
import { Filter, ShieldCheck } from 'lucide-react'
import { GlassCard, PageHeader, StatusBadge } from '../components/ui'
import { recentClicks } from '../data/mockData'

export default function ActivityPage() {
  const [classification, setClassification] = useState('all')
  const filtered = recentClicks.filter((item) => classification === 'all' || item.classification === classification)
  return (
    <>
      <PageHeader eyebrow="Request telemetry" title="Activity" description="Inspect recent human, bot, preview, prefetch, and HEAD requests." />
      <GlassCard className="filters-card activity-filters"><div className="filter-label"><Filter size={17} /> Filters</div><label><span>Classification</span><select value={classification} onChange={(e) => setClassification(e.target.value)}><option value="all">All</option><option value="human">Human</option><option value="bot">Bot</option><option value="preview">Preview</option></select></label><label><span>Device</span><select><option>All devices</option><option>Mobile</option><option>Desktop</option></select></label><label><span>Date range</span><select><option>Last 24 hours</option><option>Last 7 days</option></select></label></GlassCard>
      <GlassCard className="table-card"><div className="responsive-table"><table><thead><tr><th>Timestamp</th><th>Classification</th><th>Keyword</th><th>Device</th><th>OS</th><th>Browser</th><th>Referrer</th><th>Country</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{new Date(item.clicked_at).toLocaleString()}</td><td><StatusBadge value={item.classification} /></td><td>{item.keyword_used || '—'}</td><td>{item.device_category}</td><td>{item.operating_system}</td><td>{item.browser}</td><td>{item.referrer_domain}</td><td>{item.country || '—'}</td></tr>)}</tbody></table></div></GlassCard>
      <GlassCard className="privacy-banner"><ShieldCheck size={21} /><div><strong>Privacy protected</strong><p>Raw visitor IP addresses are never displayed or stored. Unique visitors are estimated using privacy-preserving daily hashes.</p></div></GlassCard>
    </>
  )
}
