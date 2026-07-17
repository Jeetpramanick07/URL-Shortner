import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Bot,
  ExternalLink,
  Link2,
  MousePointerClick,
  Plus,
  RefreshCw,
  Users,
  Zap,
} from 'lucide-react'
import { linksApi, analyticsApi } from '../api/services'
import { ActivityAreaChart, DonutChart, HorizontalBarChart } from '../components/Charts'
import { GlassCard, PageHeader, StatCard, StatusBadge } from '../components/ui'
import { clickTimeline, deviceData, mockLinks, osData } from '../data/mockData'

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  return payload?.items || payload?.data || []
}

export default function DashboardPage() {
  const [links, setLinks] = useState(mockLinks)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let active = true
    linksApi.list({ page: 1, page_size: 50 })
      .then((payload) => {
        const items = normalizeList(payload)
        if (active && items.length) {
          setLinks(items)
          setLive(true)
        }
      })
      .catch(() => setLive(false))
    return () => { active = false }
  }, [])

  const totals = useMemo(() => {
    const totalClicks = links.reduce((sum, item) => sum + Number(item.total_clicks ?? item.click_sequence ?? 0), 0)
    const activeLinks = links.filter((item) => item.is_active).length
    return {
      totalLinks: links.length,
      activeLinks,
      totalClicks: totalClicks || 18420,
      unique: Math.round((totalClicks || 18420) * 0.614),
    }
  }, [links])

  const topLinks = [...links].sort((a, b) => Number(b.total_clicks || 0) - Number(a.total_clicks || 0)).slice(0, 4)

  return (
    <>
      <PageHeader
        eyebrow={live ? 'Live backend data' : 'Design preview data'}
        title="Dashboard Overview"
        description="Monitor your Amazon short links and click performance."
        actions={<Link className="button primary" to="/links/new"><Plus size={18} /> Create New Link</Link>}
      />

      <div className="stats-grid six">
        <StatCard icon={Link2} label="Total links" value={totals.totalLinks || 24} trend="+12.4%" />
        <StatCard icon={Zap} label="Active links" value={totals.activeLinks || 21} trend="+4.8%" tone="cyan" />
        <StatCard icon={MousePointerClick} label="Human clicks" value={totals.totalClicks.toLocaleString()} trend="+18.2%" tone="blue" />
        <StatCard icon={Users} label="Unique visitors" value={totals.unique.toLocaleString()} trend="+9.6%" tone="green" />
        <StatCard icon={Bot} label="Bot requests" value="714" trend="-3.1%" tone="amber" />
        <StatCard icon={Activity} label="Clicks today" value="1,248" trend="+21.7%" tone="purple" />
      </div>

      <div className="dashboard-main-grid">
        <GlassCard className="chart-card activity-card">
          <div className="card-heading-row">
            <div><span className="section-kicker">Traffic</span><h2>Click activity</h2></div>
            <div className="segmented"><button className="active">7D</button><button>30D</button><button>90D</button></div>
          </div>
          <ActivityAreaChart data={clickTimeline} />
        </GlassCard>

        <GlassCard className="chart-card">
          <div className="card-heading-row"><div><span className="section-kicker">Audience</span><h2>Device distribution</h2></div><RefreshCw size={18} /></div>
          <DonutChart data={deviceData} centerLabel="72%" centerSub="Mobile" />
          <div className="legend-grid">
            {deviceData.map((item, index) => <div key={item.name}><span className={`legend-dot c${index}`} />{item.name}<strong>{item.value}%</strong></div>)}
          </div>
        </GlassCard>
      </div>

      <div className="dashboard-secondary-grid">
        <GlassCard className="table-card">
          <div className="card-heading-row"><div><span className="section-kicker">Performance</span><h2>Top-performing links</h2></div><Link to="/links" className="text-link">View all</Link></div>
          <div className="responsive-table">
            <table>
              <thead><tr><th>Link</th><th>Marketplace</th><th>Clicks</th><th>Status</th><th /></tr></thead>
              <tbody>
                {topLinks.map((item) => (
                  <tr key={item.id}>
                    <td><div className="cell-title">{item.slug}</div><div className="cell-sub">{item.domain || 'localhost'}</div></td>
                    <td>{item.target_country}</td>
                    <td>{Number(item.total_clicks ?? item.click_sequence ?? 0).toLocaleString()}</td>
                    <td><StatusBadge value={item.is_active ? 'active' : 'disabled'} /></td>
                    <td><Link className="icon-button" to={`/links/${item.id}/analytics`}><ExternalLink size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="chart-card os-card">
          <div className="card-heading-row"><div><span className="section-kicker">Platforms</span><h2>OS breakdown</h2></div></div>
          <HorizontalBarChart data={osData} />
        </GlassCard>
      </div>

      <GlassCard className="activity-strip">
        <div className="card-heading-row"><div><span className="section-kicker">Live feed</span><h2>Recent activity</h2></div></div>
        <div className="activity-cards">
          <div><span className="activity-icon green"><Link2 size={17} /></span><div><strong>New link created</strong><small>wireless-earbuds · 2 minutes ago</small></div></div>
          <div><span className="activity-icon purple"><MousePointerClick size={17} /></span><div><strong>Campaign milestone</strong><small>10,000 human clicks reached</small></div></div>
          <div><span className="activity-icon cyan"><Bot size={17} /></span><div><strong>Preview filtered</strong><small>Facebook crawler · 12 minutes ago</small></div></div>
        </div>
      </GlassCard>
    </>
  )
}
