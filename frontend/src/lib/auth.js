export async function getCurrentUser() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    if (!res.ok) throw new Error('Not authenticated')
    return await res.json()
  } catch (err) {
    throw err
  }
}

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }
  return res.json()
}

export async function register(username, email, password) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, email, password })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Register failed');
  }
  return res.json()
}

export async function logout() {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  if (!res.ok) throw new Error('Logout failed')
  return res.json()
}
