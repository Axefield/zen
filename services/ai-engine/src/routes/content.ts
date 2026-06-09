import type { IncomingMessage, ServerResponse } from "node:http"

const STRAPI_URL = process.env.STRAPI_URL ?? "http://strapi:1337"
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? ""

interface StrapiError {
  error?: { message?: string }
  message?: string
}

async function strapiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${STRAPI_URL}/api${path}`
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString("utf-8")
}

async function handleError(res: ServerResponse, response: Response) {
  let body: StrapiError = {}
  try { body = await response.json() as StrapiError } catch {}
  json(res, response.status, { error: body.error?.message ?? body.message ?? "Unknown error" })
}

const VALID_COLLECTIONS = ["articles", "products", "courses", "events", "pages", "categories"] as const
type Collection = (typeof VALID_COLLECTIONS)[number]

export async function handleContentList(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const pathParts = url.pathname.split("/").filter(Boolean)
  const collection = pathParts[pathParts.length - 1]

  if (!VALID_COLLECTIONS.includes(collection as Collection)) {
    json(res, 400, { error: `Invalid collection: ${collection}` })
    return
  }

  const params = new URLSearchParams()
  const sort = url.searchParams.get("sort")
  const limit = url.searchParams.get("limit") ?? "50"
  const populate = url.searchParams.get("populate") ?? ""
  if (sort) params.set("sort", sort)
  params.set("pagination[limit]", limit)
  if (populate) params.set("populate", populate)

  try {
    const response = await strapiFetch(`/${collection}?${params.toString()}`)
    if (!response.ok) return handleError(res, response)
    const body = await response.json()
    json(res, 200, body)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}

export async function handleContentGet(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const pathParts = url.pathname.split("/").filter(Boolean)
  const id = pathParts[pathParts.length - 1]
  const collection = pathParts[pathParts.length - 2]

  if (!VALID_COLLECTIONS.includes(collection as Collection)) {
    json(res, 400, { error: `Invalid collection: ${collection}` })
    return
  }

  const populate = url.searchParams.get("populate") ?? ""
  const params = populate ? `?populate=${populate}` : ""

  try {
    const response = await strapiFetch(`/${collection}/${id}${params}`)
    if (!response.ok) return handleError(res, response)
    const body = await response.json()
    json(res, 200, body)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}

export async function handleContentCreate(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const pathParts = url.pathname.split("/").filter(Boolean)
  const collection = pathParts[pathParts.length - 1]

  if (!VALID_COLLECTIONS.includes(collection as Collection)) {
    json(res, 400, { error: `Invalid collection: ${collection}` })
    return
  }

  try {
    const body = JSON.parse(await readBody(req))
    const response = await strapiFetch(`/${collection}`, {
      method: "POST",
      body: JSON.stringify({ data: body }),
    })
    if (!response.ok) return handleError(res, response)
    const result = await response.json()
    json(res, 201, result)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}

export async function handleContentUpdate(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const pathParts = url.pathname.split("/").filter(Boolean)
  const id = pathParts[pathParts.length - 1]
  const collection = pathParts[pathParts.length - 2]

  if (!VALID_COLLECTIONS.includes(collection as Collection)) {
    json(res, 400, { error: `Invalid collection: ${collection}` })
    return
  }

  try {
    const body = JSON.parse(await readBody(req))
    const response = await strapiFetch(`/${collection}/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data: body }),
    })
    if (!response.ok) return handleError(res, response)
    const result = await response.json()
    json(res, 200, result)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}

export async function handleContentDelete(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const pathParts = url.pathname.split("/").filter(Boolean)
  const id = pathParts[pathParts.length - 1]
  const collection = pathParts[pathParts.length - 2]

  if (!VALID_COLLECTIONS.includes(collection as Collection)) {
    json(res, 400, { error: `Invalid collection: ${collection}` })
    return
  }

  try {
    const response = await strapiFetch(`/${collection}/${id}`, { method: "DELETE" })
    if (!response.ok) return handleError(res, response)
    const result = await response.json()
    json(res, 200, result)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}
