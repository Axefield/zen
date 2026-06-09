const API_URL = import.meta.env.INTERNAL_API_URL || process.env.INTERNAL_API_URL || "http://ai-engine:4000"
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || "http://strapi:1337"

export async function fetchHealth(): Promise<{ status: string; service: string; modules: string[] }> {
  const res = await fetch(`${API_URL}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`)
  return res.json()
}

export async function fetchStrapiCount(endpoint: string): Promise<number> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}`)
    if (!res.ok) return 0
    const json = await res.json()
    return json.meta?.pagination?.total ?? 0
  } catch {
    return 0
  }
}

export async function fetchStrapiCollection<T>(endpoint: string, params?: Record<string, string>): Promise<T[]> {
  try {
    const url = new URL(`/api/${endpoint}`, STRAPI_URL)
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
    }
    const res = await fetch(url.toString())
    if (!res.ok) return []
    const json = await res.json()
    return json.data ?? []
  } catch {
    return []
  }
}

export async function fetchStrapiSingle<T>(endpoint: string, id: number): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/${endpoint}/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function fetchDashboardMetrics() {
  const [health, pages, articles, products, courses, events] = await Promise.all([
    fetchHealth().catch(() => null),
    fetchStrapiCount("pages"),
    fetchStrapiCount("articles"),
    fetchStrapiCount("products"),
    fetchStrapiCount("courses"),
    fetchStrapiCount("events"),
  ])

  return {
    apiStatus: health?.status ?? "unreachable",
    apiModules: health?.modules ?? [],
    totalContent: pages + articles + products + courses + events,
    contentBreakdown: { pages, articles, products, courses, events },
  }
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
}

export async function createContent(collection: string, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string; id?: number }> {
  try {
    const res = await fetch(`${API_URL}/api/content/${collection}`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: (body as { error?: string }).error ?? `HTTP ${res.status}` }
    }
    const body = await res.json() as { data?: { id: number } }
    return { ok: true, id: body.data?.id }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function updateContent(collection: string, id: number, data: Record<string, unknown>, token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/content/${collection}/${id}`, {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: (body as { error?: string }).error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export async function deleteContent(collection: string, id: number, token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/content/${collection}/${id}`, {
      method: "DELETE",
      headers: authHeaders(token),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: (body as { error?: string }).error ?? `HTTP ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
