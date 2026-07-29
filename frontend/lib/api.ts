// lib/api.ts

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_BASE_URL || process.env.BACKEND_BASE_URL;

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
    // Note: httpOnly cookies are NOT accessible here
    // So we'll need a different strategy for client-side auth (see note below)
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

  return fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // important if you ever use non-httpOnly session cookies
  });
}
