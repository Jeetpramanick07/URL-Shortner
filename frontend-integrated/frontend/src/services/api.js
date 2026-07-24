// Typed-ish service layer over the backend REST API.
// Endpoints are unchanged from the original project — only relocated.
import { apiRequest } from './apiClient'

export const domainsApi = {
  list: () => apiRequest('/api/domains'),
  create: (payload) => apiRequest('/api/domains', { method: 'POST', body: JSON.stringify(payload) }),
}

export const linksApi = {
  list: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== null) query.set(key, value)
    })
    return apiRequest(`/api/links${query.toString() ? `?${query}` : ''}`)
  },
  get: (id) => apiRequest(`/api/links/${id}`),
  create: (payload) => apiRequest('/api/links', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => apiRequest(`/api/links/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => apiRequest(`/api/links/${id}`, { method: 'DELETE' }),
  enable: (id) => apiRequest(`/api/links/${id}/enable`, { method: 'POST' }),
  disable: (id) => apiRequest(`/api/links/${id}/disable`, { method: 'POST' }),
}

export const analyticsApi = {
  summary: (id) => apiRequest(`/api/links/${id}/analytics/summary`),
  timeline: (id, interval = 'day') => apiRequest(`/api/links/${id}/analytics/timeline?interval=${interval}`),
  devices: (id) => apiRequest(`/api/links/${id}/analytics/devices`),
  operatingSystems: (id) => apiRequest(`/api/links/${id}/analytics/operating-systems`),
  browsers: (id) => apiRequest(`/api/links/${id}/analytics/browsers`),
  keywords: (id) => apiRequest(`/api/links/${id}/analytics/keywords`),
  referrers: (id) => apiRequest(`/api/links/${id}/analytics/referrers`),
  languages: (id) => apiRequest(`/api/links/${id}/analytics/languages`),
  recentClicks: (id, params = {}) => {
    const query = new URLSearchParams(params)
    return apiRequest(`/api/links/${id}/analytics/recent-clicks?${query}`)
  },
}

// -----------------------------------------------------------------------
// Auth API — TODO: the backend does not currently expose any auth routes
// (no /api/auth/* router exists in app/routers). These calls are wired up
// so that connecting real endpoints later is a one-line change per method.
// Until then, AuthContext falls back to a local mock session so the new
// login/signup/forgot-password screens are fully usable in the meantime.
// -----------------------------------------------------------------------
export const authApi = {
  // TODO: connect to POST /api/auth/login once implemented on the backend.
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  // TODO: connect to POST /api/auth/signup once implemented on the backend.
  signup: (payload) => apiRequest('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  // TODO: connect to POST /api/auth/forgot-password once implemented on the backend.
  forgotPassword: (payload) => apiRequest('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
}
