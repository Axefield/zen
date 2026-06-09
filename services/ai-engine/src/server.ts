import { createServer, IncomingMessage, ServerResponse } from "node:http"
import { indexDocument, removeDocument, search, getIndexStats, isHealthy, IndexableDocument } from "./search.js"
import { handleLogin, handleRegister, handleMe } from "./routes/auth.js"
import { handleChat, handleModels } from "./routes/ai.js"
import { handleContentList, handleContentGet, handleContentCreate, handleContentUpdate, handleContentDelete } from "./routes/content.js"
import { seedDefaultUser } from "./auth.js"
import { handleMcpGet, handleMcpPost } from "./mcp.js"
import { verifyToken } from "./auth.js"
import { HEALTH } from "./constants.js"

const port = Number(process.env.PORT ?? 4000)

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString("utf-8")
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

function corsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
}

function isAuthenticated(req: IncomingMessage): boolean {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) return false
  return verifyToken(authHeader.slice(7)) !== null
}

async function router(req: IncomingMessage, res: ServerResponse) {
  corsHeaders(res)

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const path = url.pathname

  // MCP protocol routes
  if (path === "/mcp" && req.method === "GET") {
    await handleMcpGet(req, res)
    return
  }

  if (path === "/mcp/messages" && req.method === "POST") {
    await handleMcpPost(req, res)
    return
  }

  if (path === "/health") {
    const searchOk = await isHealthy()
    json(res, 200, { ...HEALTH, search: searchOk ? "ok" : "unavailable" })
    return
  }

  if (path === "/api/auth/login" && req.method === "POST") {
    await handleLogin(req, res)
    return
  }

  if (path === "/api/auth/register" && req.method === "POST") {
    await handleRegister(req, res)
    return
  }

  if (path === "/api/auth/me" && req.method === "GET") {
    await handleMe(req, res)
    return
  }

  if (path === "/api/ai/chat" && req.method === "POST") {
    await handleChat(req, res)
    return
  }

  if (path === "/api/ai/models" && req.method === "GET") {
    await handleModels(req, res)
    return
  }

  // Protected content CRUD routes (require auth)
  const contentListMatch = path.match(/^\/api\/content\/(articles|products|courses|events|pages|categories)$/)
  const contentDetailMatch = path.match(/^\/api\/content\/(articles|products|courses|events|pages|categories)\/(\d+)$/)

  if (contentListMatch && req.method === "GET") {
    await handleContentList(req, res)
    return
  }

  if (contentDetailMatch && req.method === "GET") {
    await handleContentGet(req, res)
    return
  }

  if (contentListMatch && req.method === "POST") {
    if (!isAuthenticated(req)) { json(res, 401, { error: "Unauthorized" }); return }
    await handleContentCreate(req, res)
    return
  }

  if (contentDetailMatch && req.method === "PUT") {
    if (!isAuthenticated(req)) { json(res, 401, { error: "Unauthorized" }); return }
    await handleContentUpdate(req, res)
    return
  }

  if (contentDetailMatch && req.method === "DELETE") {
    if (!isAuthenticated(req)) { json(res, 401, { error: "Unauthorized" }); return }
    await handleContentDelete(req, res)
    return
  }

  if (path.startsWith("/api/search/query") && req.method === "GET") {
    const q = url.searchParams.get("q") ?? ""
    const collection = url.searchParams.get("collection") ?? undefined
    if (!q.trim()) {
      json(res, 400, { error: "Query parameter 'q' is required" })
      return
    }
    const results = await search(q, collection)
    json(res, 200, { query: q, results })
    return
  }

  if (path === "/api/search/index" && req.method === "POST") {
    const body = JSON.parse(await readBody(req))
    const { collection, document } = body as { collection: string; document: IndexableDocument }
    await indexDocument(collection as "articles" | "products" | "courses" | "events", document)
    json(res, 200, { indexed: true, collection, id: document.id })
    return
  }

  const deleteMatch = path.match(/^\/api\/search\/index\/(\w+)\/(\d+)$/)
  if (deleteMatch && req.method === "DELETE") {
    const [, collection, idStr] = deleteMatch
    await removeDocument(collection as "articles" | "products" | "courses" | "events", Number(idStr))
    json(res, 200, { removed: true })
    return
  }

  if (path === "/api/search/stats" && req.method === "GET") {
    const stats = await getIndexStats()
    json(res, 200, stats)
    return
  }

  if (path === "/api/search/reindex" && req.method === "POST") {
    const STRAPI_URL = process.env.STRAPI_URL ?? "http://strapi:1337"
    const types = ["articles", "products", "courses", "events"] as const
    interface StrapiResponse {
      data?: Array<Record<string, unknown> & { id: number }>
      error?: { message: string }
    }
    for (const type of types) {
      try {
        const url = `${STRAPI_URL}/api/${type}?pagination[limit]=200`
        const res_ = await fetch(url)
        const body = (await res_.json()) as StrapiResponse
        if (body.data) {
          for (const doc of body.data) {
            await indexDocument(type, doc as IndexableDocument)
          }
          console.log(`Reindexed ${body.data.length} ${type}`)
        }
      } catch (err) {
        console.error(`Failed to reindex ${type}:`, (err as Error).message)
      }
    }
    json(res, 200, { reindexed: true })
    return
  }

  json(res, 404, { error: "Not Found" })
}

const server = createServer(router)

await seedDefaultUser()

server.listen(port, "0.0.0.0", () => {
  console.log(`AI Engine listening on port ${port}`)
})
