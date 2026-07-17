import { useEffect, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, Moon, RefreshCw, Save, ShieldCheck, SlidersHorizontal, Sun } from 'lucide-react'
import { getApiConfig, saveApiConfig, testConnection } from '../api/client'
import { GlassCard, PageHeader, Toast } from '../components/ui'

export default function SettingsPage() {
  const [config, setConfig] = useState(getApiConfig())
  const [showKey, setShowKey] = useState(false)
  const [connection, setConnection] = useState('unknown')
  const [testing, setTesting] = useState(false)
  const [toast, setToast] = useState(null)
  const [reducedTransparency, setReducedTransparency] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-transparency', reducedTransparency)
  }, [reducedTransparency])

  const test = async () => {
    saveApiConfig(config)
    setTesting(true)
    try {
      await testConnection()
      setConnection('connected')
      setToast({ message: 'Backend connection is healthy.', type: 'success' })
    } catch (error) {
      setConnection('failed')
      setToast({ message: error.message, type: 'error' })
    } finally {
      setTesting(false)
    }
  }

  const save = () => {
    saveApiConfig(config)
    setToast({ message: 'Settings saved locally.', type: 'success' })
  }

  return (
    <>
      <PageHeader eyebrow="Workspace configuration" title="Settings" description="Configure your LinkOrbit experience and backend infrastructure." />
      <div className="settings-grid">
        <div className="settings-column wide">
          <GlassCard className="settings-card">
            <div className="panel-title"><div className="panel-icon"><RefreshCw size={20} /></div><div><h2>Backend connection</h2><p>Manage your FastAPI integration settings.</p></div></div>
            <div className="form-stack compact">
              <label className="field"><span>API base URL</span><input value={config.baseUrl} onChange={(e) => setConfig((current) => ({ ...current, baseUrl: e.target.value }))} placeholder="http://127.0.0.1:8000" /></label>
              <label className="field"><span>Admin API key</span><div className="field-with-action"><input type={showKey ? 'text' : 'password'} value={config.adminKey} onChange={(e) => setConfig((current) => ({ ...current, adminKey: e.target.value }))} /><button type="button" className="icon-button" onClick={() => setShowKey((value) => !value)}>{showKey ? <EyeOff size={17} /> : <Eye size={17} />}</button></div><small>Stored only in this browser's local storage.</small></label>
              <div className="connection-card"><div><span className={`connection-dot ${connection}`} /><strong>Connection status</strong><small>{connection === 'connected' ? 'Stable' : connection === 'failed' ? 'Offline' : 'Not tested'}</small></div><button className="button glass" onClick={test} disabled={testing}>{testing ? 'Testing…' : 'Test connection'}</button></div>
              <button className="button primary" onClick={save}><Save size={17} /> Save connection settings</button>
            </div>
          </GlassCard>

          <GlassCard className="settings-card privacy-card">
            <div className="panel-title"><div className="panel-icon cyan"><ShieldCheck size={20} /></div><div><h2>Privacy information</h2><p>How visitor telemetry is collected.</p></div></div>
            <div className="privacy-box"><CheckCircle2 size={20} /><div><strong>Visitor anonymisation</strong><p>Raw IP addresses are never stored. Unique visitors are estimated through daily privacy-preserving hashes.</p><hr /><strong>Device classification</strong><p>Device and browser data are inferred from request headers and may not always be exact.</p><hr /><strong>Location precision</strong><p>Country and city are populated only when trusted proxy headers are enabled.</p></div></div>
          </GlassCard>
        </div>

        <div className="settings-column">
          <GlassCard className="settings-card">
            <div className="panel-title"><div className="panel-icon purple"><Sun size={20} /></div><div><h2>Appearance</h2><p>Control the glass dashboard experience.</p></div></div>
            <div className="theme-options">
              <button className="theme-tile active"><Moon size={22} /><span>Dark glass</span></button>
              <button className="theme-tile"><Sun size={22} /><span>System</span></button>
            </div>
            <label className="toggle-row"><div><strong>Reduced transparency</strong><small>Use more solid panels for performance.</small></div><input type="checkbox" checked={reducedTransparency} onChange={(e) => setReducedTransparency(e.target.checked)} /></label>
            <label className="toggle-row"><div><strong>Reduced motion</strong><small>Minimise interface animations.</small></div><input type="checkbox" /></label>
          </GlassCard>

          <GlassCard className="settings-card">
            <div className="panel-title"><div className="panel-icon cyan"><SlidersHorizontal size={20} /></div><div><h2>Analytics</h2><p>Set your default reporting options.</p></div></div>
            <label className="field"><span>Default date range</span><select><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select></label>
            <label className="field"><span>Items per page</span><select><option>20</option><option>50</option><option>100</option></select></label>
            <label className="toggle-row"><div><strong>Show bot statistics</strong><small>Include automated requests in reports.</small></div><input type="checkbox" defaultChecked /></label>
          </GlassCard>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
