const BACKEND_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';

export function getToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  localStorage.removeItem('jwt_token');
}

export async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem('jwt_token', data.token);
    return { success: true };
  }
  return { success: false, error: data.error || 'Login fehlgeschlagen' };
}

export async function register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${BACKEND_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success && data.token) {
    localStorage.setItem('jwt_token', data.token);
    return { success: true };
  }
  return { success: false, error: data.error || 'Registrierung fehlgeschlagen' };
}

export async function backendFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
}
