import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Bot,
  Copy,
  ExternalLink,
  Eye,
  Laptop,
  MousePointerClick,
  Pencil,
  Smartphone,
  Users,
} from 'lucide-react'
import { analyticsApi, linksApi } from '../api/services'
import { ActivityAreaChart, DonutChart, HorizontalBarChart } from '../components/Charts'
import { GlassCard, PageHeader, StatCard, StatusBadge, Toast } from '../components/ui'
import { browserData, clickTimeline, deviceData, mockLinks, osData, recentClicks } from '../data/mockData'

const fallbackSummary = {
  total_requests: 428930,
  total_human_clicks: 391204,
  approximate_unique_visitors: 124562,
  total_bot_requests: 37726,
  total_preview_requests: 4821,
  total_prefetch_requests: 1154,
  total_head_requests: 692,
  mobile_clicks: 281667,
  desktop_clicks: 101713,
}

function normalizeBreakdown(payload, key) {
  const data = payload?.data || payload || []
  return Array.isArray(data) ? data.map((item) => ({ name: item[key] || item.name || 'unknown', value: Number(item.clicks ?? item.value ?? 0) })) : []
}

export default function AnalyticsPage() {
  const params = useParams()
  const linkId = params.id || mockLinks[0].id
  const [link, setLink] = useState(mockLinks[0])
  const [summary, setSummary] = useState(fallbackSummary)
  const [timeline, setTimeline] = useState(clickTimeline)
  const [devices, setDevices] = useState(deviceData)
  const [systems, setSystems] = useState(osData)
  const [browsers, setBrowsers] = useState(browserData)
  const [keywords, setKeywords] = useState(mockLinks[0].keywords.map((keyword, index) => ({ keyword, keyword_position: index, clicks: 78241 - index * 4221, percentage: 20 })))
  const [clicks, setClicks] = useState(recentClicks)
  const [toast, setToast] = useState(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    let active = true
    Promise.allSettled([
      linksApi.get(linkId),
      analyticsApi.summary(linkId),
      analyticsApi.timeline(linkId, 'day'),
      analyticsApi.devices(linkId),
      analyticsApi.operatingSystems(linkId),
      analyticsApi.browsers(linkId),
      analyticsApi.keywords(linkId),
      analyticsApi.recentClicks(linkId, { page: 1, page_size: 20 }),
    ]).then((results) => {
      if (!active) return
      const [linkRes, summaryRes, timelineRes, devicesRes, systemsRes, browsersRes, keywordsRes, clicksRes] = results
      if (linkRes.status === 'fulfilled') setLink(linkRes.value)
      if (summaryRes.status === 'fulfilled') { setSummary(summaryRes.value); setLive(true) }
      if (timelineRes.status === 'fulfilled') {
        const data = timelineRes.value?.data || []
        setTimeline(data.map((item) => ({ label: item.period, human: item.human_clicks, bots: item.bot_requests, previews: item.preview_requests })))
      }
      if (devicesRes.status === 'fulfilled') setDevices(normalizeBreakdown(devicesRes.value, 'device_category'))
      if (systemsRes.status === 'fulfilled') setSystems(normalizeBreakdown(systemsRes.value, 'operating_system'))
      if (browsersRes.status === 'fulfilled') setBrowsers(normalizeBreakdown(browsersRes.value, 'browser'))
      if (keywordsRes.status === 'fulfilled') setKeywords(keywordsRes.value?.data || keywordsRes.value || [])
      if (clicksRes.status === 'fulfilled') setClicks(clicksRes.value?.items || clicksRes.value?.data || [])
    })
    return () => { active = false }
  }, [linkId])

  const totalDevice = devices.reduce((sum, item) => sum + item.value, 0)
  const mobilePercent = totalDevice ? Math.round(((devices.find((item) => item.name.toLowerCase() === 'mobile')?.value || 0) / totalDevice) * 100) : 72
  const keywordBars = useMemo(() => keywords.map((item) => ({ name: item.keyword?.length > 22 ? `${item.keyword.slice(0, 22)}…` : item.keyword, value: Number(item.clicks || 0) })), [keywords])

  const copyLink = async () => {
    await navigator.clipboard.writeText(link.short_url || `http://${link.domain}/${link.slug}`)
    setToast({ message: 'Short link copied.', type: 'success' })
  }

  return (
    <>
      <PageHeader
        eyebrow={live ? 'Live analytics' : 'Design preview analytics'}
        title="Individual Link Analytics"
        description={`${link.domain || 'localhost'}/${link.slug || 'test-product'}`}
        actions={
          <>
            <button className="button glass" onClick={copyLink}><Copy size={17} /> Copy</button>
            <a className="button glass" href={link.short_url || `http://${link.domain}/${link.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={17} /> Open</a>
            <Link className="button primary" to={`/links/${linkId}/edit`}><Pencil size={17} /> Edit</Link>
          </>
        }
      />

      <GlassCard className="link-identity-bar">
        <div><span>Short link</span><strong>{link.domain || 'localhost'}/{link.slug}</strong></div>
        <div><span>ASIN</span><strong className="mono-chip">{link.asin}</strong></div>
        <div><span>Marketplace</span><strong>{link.target_country}</strong></div>
        <div><span>Keywords</span><strong>{link.keywords?.length || keywords.length}</strong></div>
        <div><span>Status</span><StatusBadge value={link.is_active ? 'active' : 'disabled'} /></div>
      </GlassCard>

      <div className="stats-grid five analytics-stats">
        <StatCard icon={Eye} label="Total requests" value={Number(summary.total_requests || 0).toLocaleString()} trend="+12.3%" />
        <StatCard icon={MousePointerClick} label="Human clicks" value={Number(summary.total_human_clicks || 0).toLocaleString()} trend="+14.8%" tone="cyan" />
        <StatCard icon={Users} label="Unique visitors" value={Number(summary.approximate_unique_visitors || 0).toLocaleString()} trend="+7.1%" tone="green" />
        <StatCard icon={Bot} label="Bot requests" value={Number(summary.total_bot_requests || 0).toLocaleString()} trend="-2.4%" tone="amber" />
        <StatCard icon={Smartphone} label="Mobile clicks" value={Number(summary.mobile_clicks || 0).toLocaleString()} trend="+11.2%" tone="blue" />
      </div>

      <div className="analytics-grid-main">
        <GlassCard className="chart-card analytics-timeline">
          <div className="card-heading-row"><div><span className="section-kicker">Traffic history</span><h2>Click activity</h2></div><div className="segmented"><button>Hourly</button><button className="active">Daily</button></div></div>
          <ActivityAreaChart data={timeline.length ? timeline : clickTimeline} />
        </GlassCard>
        <GlassCard className="chart-card">
          <div className="card-heading-row"><div><span className="section-kicker">Audience</span><h2>Device split</h2></div></div>
          <DonutChart data={devices.length ? devices : deviceData} centerLabel={`${mobilePercent}%`} centerSub="Mobile" />
          <div className="two-metric"><div><Smartphone size={17} /><span>Mobile<strong>{Number(summary.mobile_clicks || 0).toLocaleString()}</strong></span></div><div><Laptop size={17} /><span>Desktop<strong>{Number(summary.desktop_clicks || 0).toLocaleString()}</strong></span></div></div>
        </GlassCard>
      </div>

      <div className="analytics-breakdowns">
        <GlassCard className="chart-card"><div className="card-heading-row"><div><span className="section-kicker">Platform</span><h2>Operating systems</h2></div></div><HorizontalBarChart data={systems.length ? systems : osData} /></GlassCard>
        <GlassCard className="chart-card"><div className="card-heading-row"><div><span className="section-kicker">Software</span><h2>Browser performance</h2></div></div><HorizontalBarChart data={browsers.length ? browsers : browserData} /></GlassCard>
        <GlassCard className="chart-card"><div className="card-heading-row"><div><span className="section-kicker">Rotation</span><h2>Keyword performance</h2></div></div><HorizontalBarChart data={keywordBars.length ? keywordBars : [{ name: 'No clicks', value: 0 }]} /></GlassCard>
      </div>

      <GlassCard className="table-card recent-clicks-card">
        <div className="card-heading-row"><div><span className="section-kicker">Request log</span><h2>Recent click activity</h2></div><div className="segmented"><button className="active">All</button><button>Human</button><button>Bot</button></div></div>
        <div className="responsive-table">
          <table>
            <thead><tr><th>Time</th><th>Classification</th><th>Keyword</th><th>Device</th><th>OS</th><th>Browser</th><th>Language</th><th>Referrer</th></tr></thead>
            <tbody>
              {clicks.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.clicked_at).toLocaleString()}</td>
                  <td><StatusBadge value={item.classification} /></td>
                  <td>{item.keyword_used || '—'}</td>
                  <td>{item.device_category || 'unknown'}</td>
                  <td>{item.operating_system || 'unknown'}</td>
                  <td>{item.browser || 'unknown'}</td>
                  <td>{item.language || 'unknown'}</td>
                  <td>{item.referrer_domain || 'direct'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
