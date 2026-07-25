import { useState } from 'react'
import { CheckCircle2, Eye, EyeOff, RefreshCw, Save, ShieldCheck, SlidersHorizontal, User } from 'lucide-react'
import { getApiConfig, saveApiConfig, testConnection } from '../../services/apiClient'
import Card from '../../components/common/Card'
import { Field, Input, Select, Checkbox } from '../../components/common/Input'
import Button from '../../components/common/Button'
import Toast from '../../components/common/Toast'
import { useAuth } from '../../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState(getApiConfig())
  const [showKey, setShowKey] = useState(false)
  const [connection, setConnection] = useState('unknown')
  const [testing, setTesting] = useState(false)
  const [toast, setToast] = useState(null)

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
      <div className="page-header">
        <div>
          <span className="eyebrow">Workspace configuration</span>
          <h1>Settings</h1>
          <p>Configure your LinkOrbit experience and backend infrastructure.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-column wide">
          <Card className="settings-card">
            <div className="panel-title"><div className="panel-icon"><User size={20} /></div><div><h2>Profile</h2><p>Your account information.</p></div></div>
            <div className="form-grid two">
              <Field label="Full name"><Input defaultValue={user?.name || ''} disabled /></Field>
              <Field label="Email address"><Input defaultValue={user?.email || ''} disabled /></Field>
            </div>
          </Card>

          <Card className="settings-card">
            <div className="panel-title"><div className="panel-icon cyan"><RefreshCw size={20} /></div><div><h2>Backend connection</h2><p>Manage your FastAPI integration settings.</p></div></div>
            <div className="form-stack compact">
              <Field label="API base URL"><Input value={config.baseUrl} onChange={(e) => setConfig((current) => ({ ...current, baseUrl: e.target.value }))} placeholder="http://127.0.0.1:8000" /></Field>
              <Field label="Admin API key" hint="Stored only in this browser's local storage.">
                <div className="input-icon-wrap">
                  <input className="input" type={showKey ? 'text' : 'password'} value={config.adminKey} onChange={(e) => setConfig((current) => ({ ...current, adminKey: e.target.value }))} />
                  <button type="button" className="input-adorn-btn" onClick={() => setShowKey((value) => !value)}>{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </Field>
              <div className="connection-card">
                <div><span className={`connection-dot ${connection}`} /><strong>Connection status</strong><small>{connection === 'connected' ? 'Stable' : connection === 'failed' ? 'Offline' : 'Not tested'}</small></div>
                <Button variant="secondary" onClick={test} loading={testing}>Test connection</Button>
              </div>
              <Button icon={Save} onClick={save}>Save connection settings</Button>
            </div>
          </Card>

          <Card className="settings-card privacy-card">
            <div className="panel-title"><div className="panel-icon green"><ShieldCheck size={20} /></div><div><h2>Privacy information</h2><p>How visitor telemetry is collected.</p></div></div>
            <div className="privacy-box">
              <CheckCircle2 size={20} />
              <div>
                <strong>Visitor anonymisation</strong><p>Raw IP addresses are never stored. Unique visitors are estimated through daily privacy-preserving hashes.</p>
                <hr />
                <strong>Device classification</strong><p>Device and browser data are inferred from request headers and may not always be exact.</p>
                <hr />
                <strong>Location precision</strong><p>Country and city are populated only when trusted proxy headers are enabled.</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="settings-column">
          <Card className="settings-card">
            <div className="panel-title"><div className="panel-icon purple"><SlidersHorizontal size={20} /></div><div><h2>Analytics</h2><p>Set your default reporting options.</p></div></div>
            <Field label="Default date range"><Select><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></Select></Field>
            <Field label="Items per page"><Select><option>20</option><option>50</option><option>100</option></Select></Field>
            <Checkbox label="Show bot statistics" defaultChecked />
          </Card>

          <Card className="settings-card">
            <div className="panel-title"><div className="panel-icon amber"><ShieldCheck size={20} /></div><div><h2>Account security</h2><p>Manage sign-in preferences.</p></div></div>
            <Checkbox label="Require confirmation before deleting links" defaultChecked />
            <Checkbox label="Email me weekly performance summaries" />
          </Card>
        </div>
      </div>
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  )
}
