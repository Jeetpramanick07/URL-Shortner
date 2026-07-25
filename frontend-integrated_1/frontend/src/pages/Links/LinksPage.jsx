import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, ExternalLink, MoreHorizontal, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { linksApi } from '../../services/api'
import Card, { CardHeader } from '../../components/common/Card'
import { Select } from '../../components/common/Input'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import StatusBadge from '../../components/common/StatusBadge'
import ToastComp from '../../components/common/Toast'
import Button from '../../components/common/Button'
import { mockLinks } from '../../data/mockData'
import { formatNumber, normalizeList } from '../../utils/format'

export default function LinksPage() {
  const [links, setLinks] = useState(mockLinks)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [marketplace, setMarketplace] = useState('all')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const payload = await linksApi.list({ page: 1, page_size: 100 })
      const items = normalizeList(payload)
      if (items.length || payload?.total === 0) setLinks(items)
    } catch {
      setToast({ message: 'Backend unavailable. Showing design preview data.', type: 'info' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => links.filter((item) => {
    const query = search.toLowerCase()
    const matchesSearch = !query || item.slug?.toLowerCase().includes(query) || item.asin?.toLowerCase().includes(query) || item.domain?.toLowerCase().includes(query)
    const matchesStatus = status === 'all' || (status === 'active' ? item.is_active : !item.is_active)
    const matchesMarketplace = marketplace === 'all' || item.target_country === marketplace
    return matchesSearch && matchesStatus && matchesMarketplace
  }), [links, search, status, marketplace])

  const copy = async (url) => {
    await navigator.clipboard.writeText(url)
    setToast({ message: 'Short link copied to clipboard.', type: 'success' })
  }

  const toggle = async (item) => {
    try {
      const updated = item.is_active ? await linksApi.disable(item.id) : await linksApi.enable(item.id)
      setLinks((items) => items.map((link) => link.id === item.id ? { ...link, ...updated, is_active: !item.is_active } : link))
      setToast({ message: `Link ${item.is_active ? 'disabled' : 'enabled'}.`, type: 'success' })
    } catch (error) {
      setToast({ message: error.message, type: 'error' })
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.slug}? This cannot be undone.`)) return
    try {
      await linksApi.remove(item.id)
      setLinks((items) => items.filter((link) => link.id !== item.id))
      setToast({ message: 'Link deleted.', type: 'success' })
    } catch (error) {
      setToast({ message: error.message, type: 'error' })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Link management</span>
          <h1>All Smart Links</h1>
          <p>Manage and monitor your Amazon short links.</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={RefreshCw} onClick={load} loading={loading}>Refresh</Button>
          <Button as={Link} to="/create" icon={Plus}>Create Link</Button>
        </div>
      </div>

      <Card className="filters-card">
        <SearchBar value={search} onChange={setSearch} placeholder="Search slug, ASIN, or domain" />
        <label className="filter-field"><span>Marketplace</span><Select value={marketplace} onChange={(e) => setMarketplace(e.target.value)}><option value="all">All marketplaces</option><option value="IN">Amazon IN</option><option value="US">Amazon US</option><option value="UK">Amazon UK</option><option value="DE">Amazon DE</option></Select></label>
        <label className="filter-field"><span>Status</span><Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></Select></label>
      </Card>

      <Card className="table-card links-table-card">
        {filtered.length ? (
          <div className="responsive-table">
            <table>
              <thead><tr><th>Short URL</th><th>ASIN</th><th>Marketplace</th><th>Keywords</th><th>Clicks</th><th>Unique</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((item) => {
                  const expired = item.expires_at && new Date(item.expires_at) < new Date()
                  const statusValue = expired ? 'expired' : item.is_active ? 'active' : 'disabled'
                  return (
                    <tr key={item.id}>
                      <td><div className="cell-title link-cell">{item.domain || 'localhost'}/{item.slug}</div><div className="cell-sub">{item.short_url || `http://${item.domain || 'localhost'}/${item.slug}`}</div></td>
                      <td><span className="mono-chip">{item.asin}</span></td>
                      <td>{item.target_country}</td>
                      <td><span className="count-bubble">{item.keywords?.length || 0}</span></td>
                      <td>{formatNumber(item.total_clicks ?? item.click_sequence ?? 0)}</td>
                      <td>{formatNumber(item.approximate_unique_visitors ?? Math.round(Number(item.total_clicks || 0) * .7))}</td>
                      <td><button className="status-button" onClick={() => toggle(item)}><StatusBadge value={statusValue} /></button></td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-button" onClick={() => copy(item.short_url || `http://${item.domain}/${item.slug}`)} title="Copy"><Copy size={16} /></button>
                          <a className="icon-button" href={item.short_url || `http://${item.domain}/${item.slug}`} target="_blank" rel="noreferrer" title="Open"><ExternalLink size={16} /></a>
                          <Link className="icon-button" to={`/links/${item.id}/analytics`} title="Analytics"><MoreHorizontal size={16} /></Link>
                          <button className="icon-button danger" onClick={() => remove(item)} title="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No smart links found" message="Change your filters or create a new Amazon smart link." />}
        <div className="table-footer"><span>Showing {filtered.length} of {links.length} links</span><div className="pagination"><button disabled>‹</button><button className="active">1</button><button>2</button><button>3</button><button>›</button></div></div>
      </Card>

      <div className="mini-stats-row">
        <Card><span>Total clicks</span><strong>{formatNumber(links.reduce((sum, item) => sum + Number(item.total_clicks ?? item.click_sequence ?? 0), 0))}</strong></Card>
        <Card><span>Average CTR</span><strong>8.4%</strong></Card>
        <Card><span>Active links</span><strong>{links.filter((item) => item.is_active).length}</strong></Card>
        <Card><span>API calls</span><strong>42K</strong></Card>
      </div>
      <ToastComp message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
