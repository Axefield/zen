const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || "http://localhost:1337"

interface StrapiResponse<T> {
  data: T[]
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } }
}

interface StrapiSingleResponse<T> {
  data: T
}

export async function fetchCollection<T>(endpoint: string, params?: Record<string, string>): Promise<T[]> {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`)
  const json: StrapiResponse<T> = await res.json()
  return json.data
}

export async function fetchSingle<T>(endpoint: string): Promise<T | null> {
  const url = new URL(`/api/${endpoint}`, STRAPI_URL)
  const res = await fetch(url.toString())
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`)
  }
  const json: StrapiSingleResponse<T> = await res.json()
  return json.data
}

export function strapiImage(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith("http")) return url
  return `${STRAPI_URL}${url}`
}
