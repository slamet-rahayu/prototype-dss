const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

/**
 * Universal HTTP client helper for communicating with Next.js backend API routes.
 * @param {string} endpoint - API path (e.g. '/auth/login')
 * @param {Object} options - fetch options { method, body, token, headers }
 */
export async function apiRequest(endpoint, { method = 'GET', body, token, headers = {} } = {}) {
  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Auto-attach token from argument or localStorage if client-side
  let authToken = token;
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('careerpath-jwt-token');
  }

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  // Ensure leading slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Gagal memproses respons server'
  }));

  if (!response.ok) {
    const error = new Error(data.message || 'Terjadi kesalahan pada request.');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }

  return data;
}

export default apiRequest;
