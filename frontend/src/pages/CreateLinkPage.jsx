import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Calendar, CheckCircle2, GripVertical, Link2, Plus, RotateCcw, ShoppingBag, Trash2 } from 'lucide-react'
import { domainsApi, linksApi } from '../api/services'
import { GlassCard, PageHeader, Toast } from '../components/ui'
import { mockDomains } from '../data/mockData'

const marketplaces = [
  ['IN', 'India', 'amazon.in'], ['US', 'United States', 'amazon.com'], ['UK', 'United Kingdom', 'amazon.co.uk'],
  ['CA', 'Canada', 'amazon.ca'], ['AU', 'Australia', 'amazon.com.au'], ['DE', 'Germany', 'amazon.de'],
  ['FR', 'France', 'amazon.fr'], ['IT', 'Italy', 'amazon.it'], ['ES', 'Spain', 'amazon.es'],
  ['JP', 'Japan', 'amazon.co.jp'], ['AE', 'United Arab Emirates', 'amazon.ae'], ['SA', 'Saudi Arabia', 'amazon.sa'],
  ['SG', 'Singapore', 'amazon.sg'], ['BR', 'Brazil', 'amazon.com.br'], ['MX', 'Mexico', 'amazon.com.mx'],
]

const initialForm = {
  domain_id: 1,
  slug: '',
  asin: '',
  target_country: 'IN',
  associate_tag: '',
  expires_at: '',
  keywords: ['best wireless earbuds', 'bluetooth earbuds'],
}

export default function CreateLinkPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [domains, setDomains] = useState(mockDomains)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    domainsApi.list().then((payload) => {
      const items = Array.isArray(payload) ? payload : payload?.items || payload?.data || []
      if (items.length) {
        setDomains(items)
        setForm((current) => ({ ...current, domain_id: current.domain_id || items[0].id }))
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    linksApi.get(id).then((item) => {
      setForm({
        domain_id: item.domain_id,
        slug: item.slug,
        asin: item.asin,
        target_country: item.target_country,
        associate_tag: item.associate_tag || '',
        expires_at: item.expires_at ? item.expires_at.slice(0, 16) : '',
        keywords: item.keywords?.length ? item.keywords : [''],
      })
    }).catch((error) => setToast({ message: error.message, type: 'error' }))
  }, [id, isEdit])

  const selectedDomain = domains.find((domain) => Number(domain.id) === Number(form.domain_id))
  const selectedMarketplace = marketplaces.find(([code]) => code === form.target_country)
  const shortPreview = `https://${selectedDomain?.hostname || 'go.example.com'}/${form.slug || 'your-slug'}`

  const isValid = useMemo(() => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug) && /^[A-Z0-9]{10}$/.test(form.asin.toUpperCase()) && form.keywords.some((item) => item.trim()), [form])

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const updateKeyword = (index, value) => setForm((current) => ({ ...current, keywords: current.keywords.map((item, i) => i === index ? value : item) }))
  const addKeyword = () => setForm((current) => current.keywords.length >= 20 ? current : ({ ...current, keywords: [...current.keywords, ''] }))
  const removeKeyword = (index) => setForm((current) => ({ ...current, keywords: current.keywords.filter((_, i) => i !== index) }))

  const submit = async (event) => {
    event.preventDefault()
    if (!isValid) {
      setToast({ message: 'Please enter a valid slug, ASIN, and at least one keyword.', type: 'error' })
      return
    }
    const payload = {
      domain_id: Number(form.domain_id),
      slug: form.slug.toLowerCase(),
      asin: form.asin.toUpperCase(),
      target_country: form.target_country,
      keywords: form.keywords.map((item) => item.trim()).filter(Boolean),
      associate_tag: form.associate_tag.trim() || null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    }
    setSaving(true)
    try {
      const result = isEdit ? await linksApi.update(id, payload) : await linksApi.create(payload)
      setToast({ message: isEdit ? 'Link updated successfully.' : 'Smart link created successfully.', type: 'success' })
      setTimeout(() => navigate(`/links/${result.id || id}/analytics`), 800)
    } catch (error) {
      setToast({ message: error.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={isEdit ? 'Link management' : 'New campaign'}
        title={isEdit ? 'Edit Smart Amazon Link' : 'Create Smart Amazon Link'}
        description="Generate a trackable short link with cyclic keyword rotation and direct product routing."
      />

      <form onSubmit={submit} className="create-layout">
        <div className="form-stack">
          <GlassCard className="form-panel">
            <div className="panel-title"><div className="panel-icon"><Link2 size={20} /></div><div><h2>Link identity</h2><p>Choose the public domain and memorable slug.</p></div></div>
            <div className="form-grid two">
              <label className="field"><span>Select domain</span><select value={form.domain_id} onChange={(e) => updateField('domain_id', e.target.value)}>{domains.map((domain) => <option key={domain.id} value={domain.id}>{domain.hostname}</option>)}</select></label>
              <label className="field"><span>Custom slug</span><input value={form.slug} onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="wireless-earbuds" /><small>Lowercase letters, numbers, and hyphens only.</small></label>
            </div>
            <div className="url-preview"><span>Live URL preview</span><strong>{shortPreview}</strong></div>
          </GlassCard>

          <GlassCard className="form-panel">
            <div className="panel-title"><div className="panel-icon cyan"><ShoppingBag size={20} /></div><div><h2>Amazon product</h2><p>Route directly to the selected ASIN and marketplace.</p></div></div>
            <div className="form-grid two">
              <label className="field"><span>Amazon ASIN</span><input maxLength={10} value={form.asin} onChange={(e) => updateField('asin', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="B0FR4KJ6NT" /><small>Exactly 10 uppercase letters or digits.</small></label>
              <label className="field"><span>Marketplace</span><select value={form.target_country} onChange={(e) => updateField('target_country', e.target.value)}>{marketplaces.map(([code, country, host]) => <option key={code} value={code}>{country} — {host}</option>)}</select></label>
              <label className="field"><span>Associates tag <em>Optional</em></span><input value={form.associate_tag} onChange={(e) => updateField('associate_tag', e.target.value)} placeholder="mytag-21" /></label>
              <label className="field"><span>Expiration <em>Optional</em></span><div className="field-with-icon"><Calendar size={17} /><input type="datetime-local" value={form.expires_at} onChange={(e) => updateField('expires_at', e.target.value)} /></div></label>
            </div>
          </GlassCard>

          <GlassCard className="form-panel">
            <div className="panel-title-row">
              <div className="panel-title"><div className="panel-icon purple"><RotateCcw size={20} /></div><div><h2>Rotating keywords</h2><p>Human clicks consume keywords in this exact cyclic order.</p></div></div>
              <span className="count-chip">{form.keywords.length}/20</span>
            </div>
            <div className="keyword-list">
              {form.keywords.map((keyword, index) => (
                <div className="keyword-row" key={`${index}-${keyword}`}>
                  <GripVertical size={17} />
                  <span className="keyword-index">{index + 1}</span>
                  <input value={keyword} onChange={(e) => updateKeyword(index, e.target.value)} placeholder={`Keyword ${index + 1}`} />
                  <button type="button" className="icon-button danger" onClick={() => removeKeyword(index)} disabled={form.keywords.length === 1}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
            <button type="button" className="button glass full" onClick={addKeyword}><Plus size={17} /> Add keyword</button>
            <div className="rotation-note">Click {form.keywords.length + 1} returns to keyword 1. Bots, preview crawlers, prefetches and HEAD requests do not advance rotation.</div>
          </GlassCard>
        </div>

        <aside className="summary-column">
          <GlassCard className="summary-card sticky-card">
            <span className="section-kicker">Link summary</span>
            <h2>Ready to launch</h2>
            <div className="summary-list">
              <div><span>Domain</span><strong>{selectedDomain?.hostname || '—'}</strong></div>
              <div><span>Slug</span><strong>{form.slug || '—'}</strong></div>
              <div><span>ASIN</span><strong>{form.asin || '—'}</strong></div>
              <div><span>Marketplace</span><strong>{selectedMarketplace?.[1] || '—'}</strong></div>
              <div><span>Keywords</span><strong>{form.keywords.filter(Boolean).length}</strong></div>
              <div><span>Expires</span><strong>{form.expires_at ? new Date(form.expires_at).toLocaleDateString() : 'Never'}</strong></div>
            </div>
            <button className="button primary full" disabled={saving}>{saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Smart Link'} <ArrowRight size={17} /></button>
            <div className="trust-note"><CheckCircle2 size={16} /> Direct 302 product routing—no visible intermediate page.</div>
          </GlassCard>
          <GlassCard className="info-card"><strong>Pro tip</strong><p>Use the exact child ASIN when you want a specific colour, size, storage option, or variation.</p></GlassCard>
        </aside>
      </form>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
