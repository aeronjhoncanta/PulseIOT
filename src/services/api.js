const API_BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN_KEY = 'pulse_iot_access_token'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })
  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try { detail = (await response.json()).detail || detail } catch { /* non-JSON error */ }
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY)
    throw new ApiError(detail, response.status)
  }
  if (response.status === 204) return null
  return response.json()
}

export async function login(username = 'admin', password = 'pulse-demo') {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  localStorage.setItem(TOKEN_KEY, result.access_token)
  return result
}

export async function logout() {
  try { await request('/auth/logout', { method: 'POST' }) } finally { localStorage.removeItem(TOKEN_KEY) }
}

export async function ensureAuth() {
  if (!localStorage.getItem(TOKEN_KEY)) await login()
}

export const api = {
  async dashboardStats() { await ensureAuth(); return request('/dashboard/stats') },
  async devices(search = '') { await ensureAuth(); return request(`/devices${search ? `?search=${encodeURIComponent(search)}` : ''}`) },
  async createDevice(payload) { await ensureAuth(); return request('/devices', { method: 'POST', body: JSON.stringify(payload) }) },
  async deleteDevice(id) { await ensureAuth(); return request(`/devices/${encodeURIComponent(id)}`, { method: 'DELETE' }) },
  async readings(deviceId) {
    await ensureAuth()
    const query = new URLSearchParams()
    if (deviceId) query.set('device_id', deviceId)
    query.set('_t', Date.now().toString())
    return request(`/readings/latest?${query}`)
  },
  async readingsHistory(params = {}) {
    await ensureAuth()
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
    return request(`/readings/history${query.toString() ? `?${query}` : ''}`)
  },
  async createReading(payload) { await ensureAuth(); return request('/readings', { method: 'POST', body: JSON.stringify(payload) }) },
  async alerts() { await ensureAuth(); return request('/alerts') },
  async updateAlert(id, state) { await ensureAuth(); return request(`/alerts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ state }) }) },
  async thresholds() { await ensureAuth(); return request('/settings/thresholds') },
  async downloadReport() { await ensureAuth(); const token = localStorage.getItem(TOKEN_KEY); const response = await fetch(`${API_BASE}/reports/readings.csv`, { headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) throw new ApiError('Unable to export report', response.status); return response.blob() }
}
