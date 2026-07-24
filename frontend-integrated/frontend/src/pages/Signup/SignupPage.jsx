import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, User, UserPlus } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Field, Input, Checkbox } from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function SignupPage() {
  const { signup, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', agree: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    if (!form.agree) {
      setError('Please accept the Terms of Service to continue.')
      return
    }
    try {
      await signup(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start creating trackable smart links in minutes."
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    >
      <form onSubmit={submit} className="auth-form">
        <Field label="Full name" htmlFor="name">
          <Input icon={User} id="name" required placeholder="Jane Doe" value={form.name} onChange={(e) => update('name', e.target.value)} />
        </Field>

        <Field label="Email address" htmlFor="email">
          <Input icon={Mail} id="email" type="email" required placeholder="you@company.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>

        <Field label="Password" htmlFor="password" hint="Use at least 8 characters.">
          <div className="input-icon-wrap">
            <input
              id="password"
              className="input"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
            />
            <button type="button" className="input-adorn-btn" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Checkbox label={<>I agree to the Terms of Service and Privacy Policy</>} checked={form.agree} onChange={(e) => update('agree', e.target.checked)} />

        {error && <div className="form-alert">{error}</div>}

        <Button type="submit" full loading={loading} icon={UserPlus}>Create account</Button>
      </form>
    </AuthLayout>
  )
}
