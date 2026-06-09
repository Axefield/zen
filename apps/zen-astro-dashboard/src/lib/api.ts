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
