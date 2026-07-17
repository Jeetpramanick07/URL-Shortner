import { useEffect, useState } from 'react'
import { Globe2, Plus } from 'lucide-react'
import { domainsApi } from '../api/services'
import { GlassCard, PageHeader, StatusBadge, Toast } from '../components/ui'
import { mockDomains } from '../data/mockData'

export default function DomainsPage() {
  const [domains, setDomains] = useState(mockDomains)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ hostname: '', display_name: '' })
  const [toast, setToast] = useState(null)

  useEffect(() => {
    domainsApi.list().then((payload) => {
      const items = Array.isArray(payload) ? payload : payload?.items || payload?.data || []
      if (items.length) setDomains(items)
    }).catch(() => {})
  }, [])

  const create = async (event) => {
    event.preventDefault()
    try {
      const item = await domainsApi.create(form)
      setDomains((items) => [...items, item])
      setForm({ hostname: '', display_name: '' })
      setShowForm(false)
      setToast({ message: 'Domain added successfully.', type: 'success' })
    } catch (error) {
      setToast({ message: error.message, type: 'error' })
    }
  }

  return (
    <>
      <PageHeader eyebrow="Routing infrastructure" title="Domains" description="Manage the domains available for smart Amazon links." actions={<button className="button primary" onClick={() => setShowForm((value) => !value)}><Plus size={17} /> Add Domain</button>} />
      {showForm && <GlassCard className="inline-form-card"><form onSubmit={create} className="inline-form"><label className="field"><span>Hostname</span><input value={form.hostname} onChange={(e) => setForm((current) => ({ ...current, hostname: e.target.value }))} placeholder="go.example.com" required /></label><label className="field"><span>Display name</span><input value={form.display_name} onChange={(e) => setForm((current) => ({ ...current, display_name: e.target.value }))} placeholder="Primary Link Domain" required /></label><button className="button primary">Create</button></form></GlassCard>}
      <div className="domain-grid">
        {domains.map((domain) => <GlassCard className="domain-card" key={domain.id}><div className="domain-icon"><Globe2 size={22} /></div><div className="domain-copy"><strong>{domain.hostname}</strong><span>{domain.display_name}</span></div><StatusBadge value={domain.is_active ? 'active' : 'disabled'} /><div className="domain-meta"><span>Created</span><strong>{new Date(domain.created_at).toLocaleDateString()}</strong></div><p>The hostname must already point to this backend through DNS and HTTPS configuration.</p></GlassCard>)}
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
