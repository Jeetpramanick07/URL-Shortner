import { useEffect, useState } from 'react'
import { Globe2, Plus } from 'lucide-react'
import { domainsApi } from '../../services/api'
import Card from '../../components/common/Card'
import { Field, Input } from '../../components/common/Input'
import StatusBadge from '../../components/common/StatusBadge'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { mockDomains } from '../../data/mockData'
import { formatDate } from '../../utils/format'

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
      <div className="page-header">
        <div>
          <span className="eyebrow">Routing infrastructure</span>
          <h1>Domains</h1>
          <p>Manage the domains available for smart Amazon links.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowForm((value) => !value)}>Add Domain</Button>
      </div>

      {showForm && (
        <Card className="inline-form-card">
          <form onSubmit={create} className="inline-form">
            <Field label="Hostname"><Input value={form.hostname} onChange={(e) => setForm((current) => ({ ...current, hostname: e.target.value }))} placeholder="go.example.com" required /></Field>
            <Field label="Display name"><Input value={form.display_name} onChange={(e) => setForm((current) => ({ ...current, display_name: e.target.value }))} placeholder="Primary Link Domain" required /></Field>
            <Button type="submit">Create</Button>
          </form>
        </Card>
      )}

      <div className="domain-grid">
        {domains.map((domain) => (
          <Card className="domain-card" key={domain.id}>
            <div className="domain-icon"><Globe2 size={22} /></div>
            <div className="domain-copy"><strong>{domain.hostname}</strong><span>{domain.display_name}</span></div>
            <StatusBadge value={domain.is_active ? 'active' : 'disabled'} />
            <div className="domain-meta"><span>Created</span><strong>{formatDate(domain.created_at)}</strong></div>
            <p>The hostname must already point to this backend through DNS and HTTPS configuration.</p>
          </Card>
        ))}
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
