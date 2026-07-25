import { useEffect, useState } from 'react'
import { Filter, RefreshCw, ShieldCheck } from 'lucide-react'
import Card, { CardHeader } from '../../components/common/Card'
import { Select } from '../../components/common/Input'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import { linksApi, analyticsApi } from '../../services/api'
import { normalizeList } from '../../utils/format'
import { recentClicks as mockRecentClicks } from '../../data/mockData'

// There is no single global "activity feed" endpoint on the backend — only
// GET /api/links/{link_id}/analytics/recent-clicks, scoped to one link at a
// time. This page reuses that existing endpoint across every link and
// merges the results client-side, rather than inventing a new backend route.
const MAX_LINKS_TO_SAMPLE = 10
const PAGE_SIZE_PER_LINK = 20

async function loadRecentActivity(classification) {
  const linksPayload = await linksApi.list({ page: 1, page_size: MAX_LINKS_TO_SAMPLE })
  const links = normalizeList(linksPayload)
  if (!links.length) return { items: [], live: false }

  const params = { page: 1, page_size: PAGE_SIZE_PER_LINK }
  if (classification !== 'all') params.classification = classification

  const results = await Promise.allSettled(
    links.map((link) => analyticsApi.recentClicks(link.id, params))
  )

  const items = []
  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return
    const link = links[index]
    const linkItems = result.value?.items || result.value?.data || []
    linkItems.forEach((item) => items.push({ ...item, slug: link.slug, domain: link.domain }))
  })

  items.sort((a, b) => new Date(b.clicked_at) - new Date(a.clicked_at))
  return { items: items.slice(0, 50), live: true }
}

export default function ActivityPage() {
  const [classification, setClassification] = useState('all')
  const [items, setItems] = useState(mockRecentClicks)
  const [live, setLive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    loadRecentActivity(classification)
      .then((result) => {
        if (!active) return
        if (result.items.length) {
          setItems(result.items)
          setLive(result.live)
        } else {
          setItems(mockRecentClicks.filter((item) => classification === 'all' || item.classification === classification))
          setLive(false)
        }
      })
      .catch(() => {
        if (!active) return
        setItems(mockRecentClicks.filter((item) => classification === 'all' || item.classification === classification))
        setLive(false)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [classification])

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">{live ? 'Live request telemetry' : 'Design preview telemetry'}</span>
          <h1>Activity</h1>
          <p>Inspect recent human, bot, preview, prefetch, and HEAD requests across your links.</p>
        </div>
      </div>

      <Card className="filters-card activity-filters">
        <div className="filter-label"><Filter size={16} /> Filters</div>
        <label className="filter-field"><span>Classification</span><Select value={classification} onChange={(e) => setClassification(e.target.value)}><option value="all">All</option><option value="human">Human</option><option value="bot">Bot</option><option value="preview">Preview</option></Select></label>
      </Card>

      <Card className="table-card">
        <CardHeader eyebrow="Request log" title="Recent activity" actions={<Button variant="secondary" icon={RefreshCw} loading={loading} onClick={() => setClassification((current) => current)}>Refresh</Button>} />
        {loading ? <Loader label="Loading recent activity…" /> : items.length ? (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Timestamp</th><th>Link</th><th>Classification</th><th>Keyword</th><th>Device</th><th>OS</th><th>Browser</th><th>Referrer</th><th>Country</th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={`${item.id}-${item.slug || ''}`}>
                    <td>{new Date(item.clicked_at).toLocaleString()}</td>
                    <td>{item.slug ? `${item.domain || 'localhost'}/${item.slug}` : '—'}</td>
                    <td><StatusBadge value={item.classification} /></td>
                    <td>{item.keyword_used || '—'}</td>
                    <td>{item.device_category || 'unknown'}</td>
                    <td>{item.operating_system || 'unknown'}</td>
                    <td>{item.browser || 'unknown'}</td>
                    <td>{item.referrer_domain || 'direct'}</td>
                    <td>{item.country || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No activity yet" message="Once your links start receiving requests, they will show up here." />}
      </Card>

      <Card className="privacy-banner">
        <ShieldCheck size={20} />
        <div><strong>Privacy protected</strong><p>Raw visitor IP addresses are never displayed or stored. Unique visitors are estimated using privacy-preserving daily hashes.</p></div>
      </Card>
    </>
  )
}
