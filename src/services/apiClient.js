const TOKEN_KEY = 'wudi_auth_token';
const USER_KEY = 'wudi_user';
const DEVICE_KEY = 'wudi_device_id';

function normalizeBaseUrl(url) {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized.includes('/api')) {
    normalized = normalized.endsWith('/') ? `${normalized}api` : `${normalized}/api`;
  }
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_URL ?? '');

export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function buildUrl(path, queryParameters) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured. Set it in .env.');
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(cleanPath, API_BASE_URL);
  Object.entries(queryParameters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url;
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

let refreshPromise = null;

async function refreshToken() {
  const currentToken = getStoredToken();
  if (!currentToken) return null;
  if (!refreshPromise) {
    refreshPromise = rawRequest('refresh', {
      method: 'POST',
      auth: true,
      skipRefresh: true,
    })
      .then((data) => {
        if (data?.token) setStoredToken(data.token);
        return data?.token || null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function rawRequest(path, options = {}) {
  const {
    method = 'GET',
    data,
    queryParameters,
    auth: needsAuth = true,
    skipRefresh = false,
  } = options;

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Device-ID': getDeviceId(),
    'X-Timezone': getTimezone(),
  };
  const token = getStoredToken();
  if (needsAuth && token) headers.Authorization = `Bearer ${token.trim()}`;

  const response = await fetch(buildUrl(path, queryParameters), {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
  });

  if (response.status === 401 && !skipRefresh && needsAuth) {
    const newToken = await refreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken.trim()}`;
      const retryResponse = await fetch(buildUrl(path, queryParameters), {
        method,
        headers,
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      return parseResponse(retryResponse);
    }
  }

  return parseResponse(response);
}

export const apiClient = {
  get: (path, queryParameters) => rawRequest(path, { method: 'GET', queryParameters }),
  post: (path, data, options = {}) => rawRequest(path, { method: 'POST', data, ...options }),
  put: (path, data) => rawRequest(path, { method: 'PUT', data }),
  delete: (path) => rawRequest(path, { method: 'DELETE' }),
  clearSession() {
    setStoredToken(null);
    setStoredUser(null);
  },
};
