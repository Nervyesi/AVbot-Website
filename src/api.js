import { API_BASE_URL } from './constants';

// ── Token storage ──────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem('avbot_token');
export const setToken = t => localStorage.setItem('avbot_token', t);
export const clearToken = () => localStorage.removeItem('avbot_token');

// ── Base fetch ─────────────────────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${res.status}`);
  }
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const loginWithDiscord = () => {
  window.location.href = `${API_BASE_URL}/auth/login`;
};

export const fetchMe = () => apiFetch('/auth/me');

// ── Servers ────────────────────────────────────────────────────────────────

export const fetchServers = () => apiFetch('/api/servers');

export const fetchServerStats = id =>
  apiFetch(`/api/servers/${id}/stats`);

export const fetchServerAnalytics = id =>
  apiFetch(`/api/servers/${id}/analytics`);

export const fetchConfig = id =>
  apiFetch(`/api/servers/${id}/config`);

export const saveConfig = (id, updates) =>
  apiFetch(`/api/servers/${id}/config`, {
    method: 'POST',
    body: JSON.stringify(updates),
  });

// ── Protection ─────────────────────────────────────────────────────────────

export const fetchProtectionStats = id =>
  apiFetch(`/api/servers/${id}/protection/stats`);

export const fetchProtectionLog = (id, limit = 50) =>
  apiFetch(`/api/servers/${id}/protection/log?limit=${limit}`);

// ── Engagement ─────────────────────────────────────────────────────────────

export const fetchRaids = (id, activeOnly = false) =>
  apiFetch(`/api/servers/${id}/raids${activeOnly ? '?active_only=true' : ''}`);

export const fetchEngage = id =>
  apiFetch(`/api/servers/${id}/engage`);

export const fetchLeaderboard = (id, limit = 25) =>
  apiFetch(`/api/servers/${id}/leaderboard?limit=${limit}`);

// ── Health ─────────────────────────────────────────────────────────────────

export const fetchHealth = () =>
  fetch(`${API_BASE_URL}/health`).then(r => r.json()).catch(() => null);
