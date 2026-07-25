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
import { linksApi } from '../../services/api'
import { ActivityAreaChart, DonutChart, HorizontalBarChart } from '../../components/dashboard/Charts'
import Card, { CardHeader } from '../../components/common/Card'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import { clickTimeline, deviceData, mockLinks, osData } from '../../data/mockData'
import { formatNumber, normalizeList } from '../../utils/format'

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
      <div className="page-header">
        <div>
          <span className="eyebrow">{live ? 'Live backend data' : 'Design preview data'}</span>
          <h1>Dashboard Overview</h1>
          <p>Monitor your Amazon short links and click performance.</p>
        </div>
        <Button as={Link} to="/create" icon={Plus}>Create New Link</Button>
      </div>

      <div className="stats-grid six">
        <StatCard icon={Link2} label="Total links" value={totals.totalLinks || 24} trend="+12.4%" tone="blue" />
        <StatCard icon={Zap} label="Active links" value={totals.activeLinks || 21} trend="+4.8%" tone="cyan" />
        <StatCard icon={MousePointerClick} label="Human clicks" value={formatNumber(totals.totalClicks)} trend="+18.2%" tone="green" />
        <StatCard icon={Users} label="Unique visitors" value={formatNumber(totals.unique)} trend="+9.6%" tone="purple" />
        <StatCard icon={Bot} label="Bot requests" value="714" trend="-3.1%" tone="amber" />
        <StatCard icon={Activity} label="Clicks today" value="1,248" trend="+21.7%" tone="blue" />
      </div>

      <div className="dashboard-main-grid">
        <Card className="chart-card activity-card">
          <CardHeader eyebrow="Traffic" title="Click activity" actions={<div className="segmented"><button className="active">7D</button><button>30D</button><button>90D</button></div>} />
          <ActivityAreaChart data={clickTimeline} />
        </Card>

        <Card className="chart-card">
          <CardHeader eyebrow="Audience" title="Device distribution" actions={<RefreshCw size={17} />} />
          <DonutChart data={deviceData} centerLabel="72%" centerSub="Mobile" />
          <div className="legend-grid">
            {deviceData.map((item, index) => <div key={item.name}><span className={`legend-dot c${index}`} />{item.name}<strong>{item.value}%</strong></div>)}
          </div>
        </Card>
      </div>

      <div className="dashboard-secondary-grid">
        <Card className="table-card">
          <CardHeader eyebrow="Performance" title="Top-performing links" actions={<Link to="/links" className="text-link">View all</Link>} />
          <div className="responsive-table">
            <table>
              <thead><tr><th>Link</th><th>Marketplace</th><th>Clicks</th><th>Status</th><th /></tr></thead>
              <tbody>
                {topLinks.map((item) => (
                  <tr key={item.id}>
                    <td><div className="cell-title">{item.slug}</div><div className="cell-sub">{item.domain || 'localhost'}</div></td>
                    <td>{item.target_country}</td>
                    <td>{formatNumber(item.total_clicks ?? item.click_sequence ?? 0)}</td>
                    <td><StatusBadge value={item.is_active ? 'active' : 'disabled'} /></td>
                    <td><Link className="icon-button" to={`/links/${item.id}/analytics`}><ExternalLink size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="chart-card os-card">
          <CardHeader eyebrow="Platforms" title="OS breakdown" />
          <HorizontalBarChart data={osData} />
        </Card>
      </div>

      <Card className="activity-strip">
        <CardHeader eyebrow="Live feed" title="Recent activity" />
        <div className="activity-cards">
          <div><span className="activity-icon green"><Link2 size={17} /></span><div><strong>New link created</strong><small>wireless-earbuds · 2 minutes ago</small></div></div>
          <div><span className="activity-icon purple"><MousePointerClick size={17} /></span><div><strong>Campaign milestone</strong><small>10,000 human clicks reached</small></div></div>
          <div><span className="activity-icon blue"><Bot size={17} /></span><div><strong>Preview filtered</strong><small>Facebook crawler · 12 minutes ago</small></div></div>
        </div>
      </Card>
    </>
  )
}
