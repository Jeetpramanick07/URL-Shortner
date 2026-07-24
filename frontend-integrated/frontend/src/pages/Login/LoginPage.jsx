import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Field, Input, Checkbox } from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '', remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await login(form)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your smart links and analytics."
      footer={<>Don't have an account? <Link to="/signup">Sign up for free</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        <Field label="Email address" htmlFor="email">
          <Input icon={Mail} id="email" type="email" required placeholder="you@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>

        <Field label="Password" htmlFor="password">
          <div className="input-icon-wrap">
            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            <button type="button" className="input-adorn-btn" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <div className="auth-row-between">
          <Checkbox label="Remember me" checked={form.remember} onChange={(e) => update('remember', e.target.checked)} />
          <Link to="/forgot-password" className="text-link">Forgot password?</Link>
        </div>

        {error && <div className="form-alert">{error}</div>}

        <Button type="submit" full loading={loading} icon={LogIn}>Log in</Button>
      </form>
    </AuthLayout>
  )
}
