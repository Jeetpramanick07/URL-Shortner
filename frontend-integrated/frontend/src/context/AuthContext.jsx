import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

const STORAGE_TOKEN_KEY = 'linkorbit_auth_token'
const STORAGE_USER_KEY = 'linkorbit_auth_user'

function readStoredSession() {
  try {
    const token =
      localStorage.getItem(STORAGE_TOKEN_KEY) ||
      sessionStorage.getItem(STORAGE_TOKEN_KEY)

    const rawUser =
      localStorage.getItem(STORAGE_USER_KEY) ||
      sessionStorage.getItem(STORAGE_USER_KEY)

    if (!token || !rawUser) return null

    return {
      token,
      user: JSON.parse(rawUser),
    }
  } catch {
    return null
  }
}

function persistSession(session, remember = true) {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USER_KEY)
  sessionStorage.removeItem(STORAGE_TOKEN_KEY)
  sessionStorage.removeItem(STORAGE_USER_KEY)

  if (!session) return

  const storage = remember ? localStorage : sessionStorage

  storage.setItem(STORAGE_TOKEN_KEY, session.token)
  storage.setItem(STORAGE_USER_KEY, JSON.stringify(session.user))
}

// Temporary authentication until the backend has real auth endpoints.
function createMockSession(email) {
  return {
    token: `mock-jwt.${btoa(email)}.${Date.now()}`,
    user: {
      name: email.split('@')[0] || 'User',
      email,
    },
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readStoredSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session) {
      persistSession(session)
    }
  }, [session])

  const login = useCallback(async ({ email, password, remember = true }) => {
    setLoading(true)
    setError(null)

    try {
      // Replace with:
      // const data = await authApi.login({ email, password })
      if (!email || !password) {
        throw new Error('Email and password are required.')
      }

      const next = createMockSession(email)

      persistSession(next, remember)

      setSession(next)

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
      // Replace with:
      // const data = await authApi.signup({ name, email, password })
      if (!name || !email || !password) {
        throw new Error('All fields are required.')
      }

      const next = createMockSession(email)
      next.user.name = name

      persistSession(next, true)

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
      // Replace with:
      // await authApi.forgotPassword({ email })
      if (!email) {
        throw new Error('Enter the email associated with your account.')
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      return {
        message: `If ${email} has an account, a reset link has been sent.`,
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    persistSession(null)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token),
      loading,
      error,
      login,
      signup,
      logout,
      forgotPassword,
    }),
    [session, loading, error, login, signup, logout, forgotPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}