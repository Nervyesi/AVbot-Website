// DISCORD ID HANDLING:
// Discord Snowflakes (channel/role/guild/user/message IDs) are 17-19 digit
// numbers that exceed JS Number.MAX_SAFE_INTEGER (9007199254740991). NEVER
// call parseInt(), Number(), or +x on a Discord ID — last digits will be
// silently corrupted. Always send IDs as strings: { channel_id: String(v) }
// The backend accepts strings and resolves them via resolve_channel/resolve_role.
// Internal DB IDs (panel_id, button_id, ticket_id) are small auto-increment
// ints and are safe to use as numbers.
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
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.detail || 'Access denied — you need Administrator permission in this guild.');
    err.code = 403;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ───────────────────────────────────────────────────────────────────

export const loginWithDiscord = () => { window.location.href = `${API_BASE_URL}/auth/login`; };
export const fetchMe = () => apiFetch('/auth/me');

// ── Servers ────────────────────────────────────────────────────────────────

export const fetchServers = () => apiFetch('/api/servers');
export const fetchServerStats = id => apiFetch(`/api/servers/${id}/stats`);
export const fetchServerAnalytics = (id, timeframe = 'week') =>
  apiFetch(`/api/servers/${id}/analytics?timeframe=${timeframe}`);
export const fetchConfig = id => apiFetch(`/api/servers/${id}/config`);
export const saveConfig = (id, updates) =>
  apiFetch(`/api/servers/${id}/config`, { method: 'POST', body: JSON.stringify(updates) });

// ── Protection ─────────────────────────────────────────────────────────────

export const fetchProtectionStats = id => apiFetch(`/api/servers/${id}/protection/stats`);
export const fetchProtectionLog = (id, limit = 50) =>
  apiFetch(`/api/servers/${id}/protection/log?limit=${limit}`);
export const sendProtectionMessage = id =>
  apiFetch(`/api/servers/${id}/protection/send-message`, { method: 'POST' });

// ── Admin ──────────────────────────────────────────────────────────────────

export const fetchFlaggedUsers = id => apiFetch(`/api/servers/${id}/flagged`);
export const fetchAuditLog = (id, limit = 50) =>
  apiFetch(`/api/servers/${id}/audit-log?limit=${limit}`);

// ── Engagement ─────────────────────────────────────────────────────────────

export const fetchRaids = (id, activeOnly = false) =>
  apiFetch(`/api/servers/${id}/raids${activeOnly ? '?active_only=true' : ''}`);
export const fetchEngage = id => apiFetch(`/api/servers/${id}/engage`);

export const fetchEngagePools = (id) =>
  apiFetch(`/api/servers/${id}/engage/pools`);

export const updateEngagePool = (serverId, poolId, body) =>
  apiFetch(`/api/servers/${serverId}/engage/pools/${poolId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
export const fetchLeaderboard = (id, limit = 25) =>
  apiFetch(`/api/servers/${id}/leaderboard?limit=${limit}`);

// ── Verify ─────────────────────────────────────────────────────────────────

export const sendVerifyMessage = (serverId, channelId) =>
  apiFetch(`/api/servers/${serverId}/verify/send-message`, {
    method: 'POST',
    body: JSON.stringify({ channel_id: String(channelId).trim() }),
  });

// ── Tickets ────────────────────────────────────────────────────────────────

export const sendTicketsPanel = id =>
  apiFetch(`/api/servers/${id}/tickets/send-panel`, { method: 'POST' });
export const fetchTicketsList = (id, status = 'open', limit = 50) =>
  apiFetch(`/api/servers/${id}/tickets/list?status=${status}&limit=${limit}`);
export const fetchTicketsStats = id => apiFetch(`/api/servers/${id}/tickets/stats`);

// ── RoleSelect ─────────────────────────────────────────────────────────────

export const listRolePanels = (serverId) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels`);

export const createRolePanel = (serverId, body) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels`, {
    method: 'POST', body: JSON.stringify(body),
  });

export const updateRolePanel = (serverId, panelId, body) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels/${panelId}`, {
    method: 'PATCH', body: JSON.stringify(body),
  });

export const deleteRolePanel = (serverId, panelId) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels/${panelId}`, {
    method: 'DELETE',
  });

export const createRoleButton = (serverId, panelId, body) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels/${panelId}/buttons`, {
    method: 'POST', body: JSON.stringify(body),
  });

export const updateRoleButton = (serverId, panelId, buttonId, body) =>
  apiFetch(
    `/api/servers/${serverId}/roleselect/panels/${panelId}/buttons/${buttonId}`,
    { method: 'PATCH', body: JSON.stringify(body) }
  );

export const deleteRoleButton = (serverId, panelId, buttonId) =>
  apiFetch(
    `/api/servers/${serverId}/roleselect/panels/${panelId}/buttons/${buttonId}`,
    { method: 'DELETE' }
  );

export const sendRolePanel = (serverId, panelId, channelId) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels/${panelId}/send`, {
    method: 'POST', body: JSON.stringify({ channel_id: String(channelId).trim() }),
  });

export const refreshRolePanel = (serverId, panelId) =>
  apiFetch(`/api/servers/${serverId}/roleselect/panels/${panelId}/refresh`, {
    method: 'POST',
  });

// ── Forms ──────────────────────────────────────────────────────────────────

export const listForms = (sid) =>
  apiFetch(`/api/servers/${sid}/forms`);

export const createForm = (sid, name) =>
  apiFetch(`/api/servers/${sid}/forms`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const updateForm = (sid, formId, updates) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const deleteForm = (sid, formId) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}`, { method: 'DELETE' });

export const createFormField = (sid, formId, field) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}/fields`, {
    method: 'POST',
    body: JSON.stringify(field),
  });

export const updateFormField = (sid, formId, fieldId, updates) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}/fields/${fieldId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });

export const deleteFormField = (sid, formId, fieldId) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' });

export const sendForm = (sid, formId, channelId) =>
  apiFetch(`/api/servers/${sid}/forms/${formId}/send`, {
    method: 'POST',
    body: JSON.stringify({ channel_id: String(channelId).trim() }),
  });

// ── Raid ───────────────────────────────────────────────────────────────────

export const fetchRaidSettings = (sid) =>
  apiFetch(`/api/servers/${sid}/raid/settings`);

export const saveRaidSettings = (sid, updates) =>
  apiFetch(`/api/servers/${sid}/raid/settings`, {
    method: 'PATCH', body: JSON.stringify(updates),
  });

export const fetchRaidList = (sid, status = 'active', limit = 50) =>
  apiFetch(`/api/servers/${sid}/raid/raids?status=${status}&limit=${limit}`);

export const createRaid = (sid, body) =>
  apiFetch(`/api/servers/${sid}/raid/raids`, {
    method: 'POST', body: JSON.stringify(body),
  });

export const endRaid = (sid, raidId) =>
  apiFetch(`/api/servers/${sid}/raid/raids/${raidId}/end`, { method: 'POST' });

export const fetchRaidLeaderboard = (sid, limit = 10) =>
  apiFetch(`/api/servers/${sid}/raid/leaderboard?limit=${limit}`);

export const fetchRaidVerificationLog = (sid, { raidId, userId, limit = 50 } = {}) => {
  const params = new URLSearchParams({ limit });
  if (raidId)  params.set('raid_id', raidId);
  if (userId)  params.set('user_id_filter', userId);
  return apiFetch(`/api/servers/${sid}/raid/verification-log?${params}`);
};

export const runRaidManualCheck = (sid, raidId, identifier) =>
  apiFetch(`/api/servers/${sid}/raid/manual-check`, {
    method: 'POST',
    body: JSON.stringify({ raid_id: raidId, identifier: String(identifier) }),
  });

export const sendRaidGuide = (sid) =>
  apiFetch(`/api/servers/${sid}/raid/send-guide`, { method: 'POST' });

export const fetchRaidScrapingHealth = (sid) =>
  apiFetch(`/api/servers/${sid}/raid/scraping-health`);

export const fetchRaidGuideDefaults = () =>
  apiFetch('/api/raid/guide-defaults');

// ── Health ─────────────────────────────────────────────────────────────────

export const fetchHealth = () =>
  fetch(`${API_BASE_URL}/health`).then(r => r.json()).catch(() => null);

// ── Asset library ──────────────────────────────────────────────────────────

export const listAssets = (serverId) =>
  apiFetch(`/api/servers/${serverId}/assets`);

export const uploadAsset = async (serverId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/servers/${serverId}/assets/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (res.status === 401) { clearToken(); throw new Error('Unauthorized'); }
  if (!res.ok) {
    let detail = 'Upload failed';
    try { const err = await res.json(); detail = err.detail || detail; } catch {}
    throw new Error(detail);
  }
  return res.json();
};

export const deleteAsset = (serverId, assetId) =>
  apiFetch(`/api/servers/${serverId}/assets/${assetId}`, { method: 'DELETE' });
