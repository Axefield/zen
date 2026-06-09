const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:4000"

export interface User {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? "Login failed")
  }
  return res.json()
}

export function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)zen_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export function setToken(token: string): void {
  document.cookie = `zen_token=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`
}

export function clearToken(): void {
  document.cookie = "zen_token=; path=/; max-age=0; SameSite=Strict"
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export async function fetchUser(token: string): Promise<User> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to fetch user")
  const data = await res.json()
  return (data as { user: User }).user
}
