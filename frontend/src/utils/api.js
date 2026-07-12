const BASE_URL = ''; // Proxied via Vite config to http://localhost:4000

async function request(url, options = {}) {
  const token = localStorage.getItem('transitops_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${BASE_URL}${url}`, config);

  // Auto logout on 401 (token expired/invalid)
  if (response.status === 401 && !url.includes('/auth/login')) {
    localStorage.removeItem('transitops_token');
    localStorage.removeItem('transitops_user');
    window.location.hash = '#login';
    window.dispatchEvent(new Event('auth-change'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return response.text();
  }

  return response.json();
}

export const api = {
  get: (url, options) => request(url, { ...options, method: 'GET' }),
  post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
  delete: (url, options) => request(url, { ...options, method: 'DELETE' })
};
