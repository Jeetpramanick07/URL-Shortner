import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, SendHorizonal } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import { Field, Input } from '../../components/common/Input'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage() {
  const { forgotPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(null)

  const submit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const result = await forgotPassword({ email })
      setSent(result.message)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<>Remembered it after all? <Link to="/login">Back to log in</Link></>}
    >
      {sent ? (
        <div className="form-success">{sent}</div>
      ) : (
        <form onSubmit={submit} className="auth-form">
          <Field label="Email address" htmlFor="email">
            <Input icon={Mail} id="email" type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error && <div className="form-alert">{error}</div>}
          <Button type="submit" full loading={loading} icon={SendHorizonal}>Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  )
}
