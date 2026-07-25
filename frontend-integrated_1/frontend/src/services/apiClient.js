// Backend connection settings + low-level fetch wrapper.
// API contract is untouched — only the file location changed during the
// frontend restructure. Backend base URL / admin key mechanism preserved.

const ENV_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'
const ENV_ADMIN_KEY = import.meta.env.VITE_ADMIN_API_KEY || 'change-this-secret'

export const getApiConfig = () => ({
  baseUrl: localStorage.getItem('linkorbit_api_base_url') || ENV_BASE_URL,
  adminKey: localStorage.getItem('linkorbit_admin_key') || ENV_ADMIN_KEY,
})

export const saveApiConfig = ({ baseUrl, adminKey }) => {
  localStorage.setItem('linkorbit_api_base_url', baseUrl.replace(/\/$/, ''))
  localStorage.setItem('linkorbit_admin_key', adminKey)
}

export async function apiRequest(path, options = {}) {
  const { baseUrl, adminKey } = getApiConfig()
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Key': adminKey,
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const body = await response.json()
      message = typeof body.detail === 'string' ? body.detail : message
    } catch {
      // Preserve the status-based message when the body is not JSON.
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

export async function testConnection() {
  const { baseUrl } = getApiConfig()
  const response = await fetch(`${baseUrl}/health`)
  if (!response.ok) throw new Error('Backend health check failed')
  return response.json()
}
