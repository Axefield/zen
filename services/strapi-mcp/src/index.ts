import { createServer } from "node:http"
import { request as httpRequest } from "node:http"
import type { IncomingMessage, ServerResponse } from "node:http"

const STRAPI_URL = process.env.STRAPI_URL ?? "http://strapi:1337"
const STRAPI_MCP_TOKEN = process.env.STRAPI_MCP_TOKEN ?? ""
const STRAPI_ADMIN_EMAIL = process.env.STRAPI_ADMIN_EMAIL ?? "admin@truligon.io"
const STRAPI_ADMIN_PASSWORD = process.env.STRAPI_ADMIN_PASSWORD ?? "admin123"
const PORT = Number(process.env.PORT ?? 1338)

let mcpToken = STRAPI_MCP_TOKEN

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

async function ensureToken(): Promise<string> {
  if (mcpToken) return mcpToken

  try {
    // Login to Strapi admin API
    const loginRes = await fetch(`${STRAPI_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: STRAPI_ADMIN_EMAIL, password: STRAPI_ADMIN_PASSWORD }),
    })

    if (!loginRes.ok) {
      console.warn(`MCP relay: admin login failed (${loginRes.status}) — MCP will not be available`)
      return ""
    }

    const loginData = (await loginRes.json()) as { data?: { token?: string } }
    const jwt = loginData?.data?.token
    if (!jwt) {
      console.warn("MCP relay: no token in admin login response")
      return ""
    }

    // Check if an MCP token already exists
    const listRes = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })

    if (listRes.ok) {
      const listData = (await listRes.json()) as { data?: Array<{ id: number; name: string }> }
      const existing = listData?.data?.find((t) => t.name === "MCP Relay")
      if (existing) {
        // Token already exists but we can't retrieve the value — admin must set STRAPI_MCP_TOKEN
        console.warn("MCP relay: existing 'MCP Relay' token found but value cannot be retrieved. Set STRAPI_MCP_TOKEN in .env")
        return ""
      }
    }

    // Create a new MCP token
    const createRes = await fetch(`${STRAPI_URL}/admin/api-tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ name: "MCP Relay", description: "Auto-created by strapi-mcp relay", type: "full-access" }),
    })

    if (!createRes.ok) {
      console.warn(`MCP relay: token creation failed (${createRes.status})`)
      return ""
    }

    const createData = (await createRes.json()) as { data?: { accessKey?: string } }
    const newToken = createData?.data?.accessKey
    if (!newToken) {
      console.warn("MCP relay: no accessKey in token creation response")
      return ""
    }

    console.log("MCP relay: created new 'MCP Relay' token")
    return newToken
  } catch (err) {
    console.warn("MCP relay: failed to provision token:", (err as Error).message)
    return ""
  }
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)

  if (url.pathname === "/health") {
    json(res, 200, { status: "ok", mcp_configured: !!mcpToken })
    return
  }

  if (!url.pathname.startsWith("/mcp")) {
    json(res, 404, { error: "Not Found" })
    return
  }

  if (!mcpToken) {
    json(res, 502, { error: "MCP token not configured. Set STRAPI_MCP_TOKEN in .env" })
    return
  }

  const strapiUrl = new URL(url.pathname + url.search, STRAPI_URL)

  const headers: Record<string, string> = {
    Authorization: `Bearer ${mcpToken}`,
    host: strapiUrl.host,
  }

  if (req.headers["content-type"]) headers["content-type"] = req.headers["content-type"] as string
  if (req.headers["accept"]) headers["accept"] = req.headers["accept"] as string

  const proxyReq = httpRequest(
    {
      hostname: strapiUrl.hostname,
      port: strapiUrl.port || 1337,
      path: strapiUrl.pathname + url.search,
      method: req.method,
      headers,
    },
    (proxyRes: IncomingMessage) => {
      const statusCode = proxyRes.statusCode ?? 502
      const resHeaders: Record<string, string | string[]> = {}
      if (proxyRes.headers["content-type"]) resHeaders["content-type"] = proxyRes.headers["content-type"]
      if (proxyRes.headers["transfer-encoding"]) resHeaders["transfer-encoding"] = proxyRes.headers["transfer-encoding"]
      if (proxyRes.headers["cache-control"]) resHeaders["cache-control"] = proxyRes.headers["cache-control"]

      res.writeHead(statusCode, resHeaders)
      proxyRes.pipe(res)
    }
  )

  proxyReq.on("error", () => {
    json(res, 502, { error: "Bad Gateway", message: "Could not reach Strapi MCP" })
  })

  req.pipe(proxyReq)
})

mcpToken = await ensureToken()

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Strapi MCP relay listening on port ${PORT}`)
  console.log(`Proxying /mcp -> ${STRAPI_URL}/mcp`)
})
