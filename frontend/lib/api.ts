// lib/api.ts

function getBackendUrl(): string {
  const envUrl =
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL ||
    process.env.BACKEND_BASE_URL ||
    'http://localhost:5000/api';

  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl += '/api';
  }
  return cleanUrl;
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  useServerCookies: boolean = false
) {
  let token: string | undefined;

  if (useServerCookies) {
    // In server components or actions — cookies() is async
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('auth_token')?.value;
  } else {
    // In client components — read from document.cookie (not httpOnly!)
    token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token='))
      ?.split('=')[1];
  }

  const headers = new Headers(options.headers);

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const baseUrl = getBackendUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return fetch(`${baseUrl}${cleanEndpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

