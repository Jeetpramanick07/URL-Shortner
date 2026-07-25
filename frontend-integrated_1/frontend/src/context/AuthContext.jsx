import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)
const STORAGE_TOKEN_KEY = 'linkorbit_auth_token'
const STORAGE_USER_KEY = 'linkorbit_auth_user'

function readStoredSession() {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY)
    const rawUser = localStorage.getItem(STORAGE_USER_KEY)
    if (!token || !rawUser) return null
    return { token, user: JSON.parse(rawUser) }
  } catch {
    return null
  }
}

function persistSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_USER_KEY)
    return
  }
  localStorage.setItem(STORAGE_TOKEN_KEY, session.token)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(session.user))
}

// Creates a placeholder session so the UI is fully functional before the
// backend exposes real auth endpoints. Replace with the real token/user
// object returned by authApi.login / authApi.signup.
function createMockSession(email) {
  return {
    token: `mock-jwt.${btoa(email)}.${Date.now()}`,
    user: { name: email.split('@')[0] || 'User', email },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    persistSession(session)
  }, [session])

  const login = useCallback(async ({ email, password, remember = true }) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: swap this block for `const data = await authApi.login({ email, password })`
      // once POST /api/auth/login exists on the backend, then build the
      // session from the real token + user payload it returns.
      if (!email || !password) throw new Error('Email and password are required.')
      const next = createMockSession(email)
      setSession(next)
      if (!remember) sessionStorage.setItem(STORAGE_TOKEN_KEY, next.token)
      return next
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: swap this block for `const data = await authApi.signup({ name, email, password })`
      // once POST /api/auth/signup exists on the backend.
      if (!name || !email || !password) throw new Error('All fields are required.')
      const next = createMockSession(email)
      next.user.name = name
      setSession(next)
      return next
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async ({ email }) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: swap for `await authApi.forgotPassword({ email })` once the
      // backend exposes a reset-password flow.
      if (!email) throw new Error('Enter the email associated with your account.')
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { message: `If ${email} has an account, a reset link has been sent.` }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(() => ({
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session?.token),
    loading,
    error,
    login,
    signup,
    logout,
    forgotPassword,
  }), [session, loading, error, login, signup, logout, forgotPassword])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
