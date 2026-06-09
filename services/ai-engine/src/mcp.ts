import { Server } from "@modelcontextprotocol/sdk/server"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse"
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types"
import type { IncomingMessage, ServerResponse } from "node:http"
import { search } from "./search.js"
import { HEALTH } from "./constants.js"

const STRAPI_URL = process.env.STRAPI_URL ?? "http://strapi:1337"
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN ?? ""

const SEARCHABLE_TYPES = ["articles", "products", "courses", "events"] as const
const MCP_COLLECTIONS = [...SEARCHABLE_TYPES, "pages", "categories"] as const

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

interface McpServerState {
  server: Server
  transports: Map<string, SSEServerTransport>
}

function createMcpServer(): Server {
  const server = new Server(
    { name: "zen-mcp", version: "0.1.0" },
    { capabilities: { tools: {}, resources: {} } }
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "health",
        description: "Check ai-engine service health",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
      {
        name: "search_query",
        description: "Full-text search across all content types (articles, products, courses, events)",
        inputSchema: {
          type: "object",
          properties: {
            q: { type: "string", description: "Search query" },
            collection: {
              type: "string",
              enum: ["articles", "products", "courses", "events"],
              description: "Optional: limit search to one content type",
            },
          },
          required: ["q"],
        },
      },
      {
        name: "ai_chat",
        description: "Send a chat message to the AI model and get a response",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string", description: "The message to send" },
          },
          required: ["message"],
        },
      },
      {
        name: "search_stats",
        description: "Get Meilisearch index statistics (document count per collection)",
        inputSchema: { type: "object", properties: {}, required: [] },
      },
    ],
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request: { params: { name: string; arguments?: Record<string, unknown> } }) => {
    const { name, arguments: args } = request.params

    switch (name) {
      case "health": {
        return {
          content: [{ type: "text" as const, text: JSON.stringify(HEALTH, null, 2) }],
        }
      }

      case "search_query": {
        const q = String(args?.q ?? "")
        const collection = args?.collection ? String(args.collection) : undefined
        if (!q.trim()) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: "Query parameter 'q' is required" }],
          }
        }
        const results = await search(q, collection)
        return {
          content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        }
      }

      case "search_stats": {
        const { getIndexStats } = await import("./search.js")
        const stats = await getIndexStats()
        return {
          content: [{ type: "text" as const, text: JSON.stringify(stats, null, 2) }],
        }
      }

      case "ai_chat": {
        const message = String(args?.message ?? "")
        if (!message.trim()) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: "Message is required" }],
          }
        }
        try {
          const { getAiProvider } = await import("./ai/index.js")
          const provider = getAiProvider()
          const response = await provider.chat({
            messages: [{ role: "user", content: message }],
          })
          return {
            content: [{ type: "text" as const, text: response.message.content }],
          }
        } catch (err) {
          return {
            isError: true,
            content: [{ type: "text" as const, text: `AI chat failed: ${(err as Error).message}` }],
          }
        }
      }

      default:
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Unknown tool: ${name}` }],
        }
    }
  })

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: "zen://content/{collection}",
        name: "Content Collection List",
        description: "List items in a content collection (articles, products, courses, events, pages, categories)",
        mimeType: "application/json",
      },
      {
        uriTemplate: "zen://content/{collection}/{id}",
        name: "Content Item",
        description: "Get a single content item by collection and ID",
        mimeType: "application/json",
      },
    ],
  }))

  server.setRequestHandler(ReadResourceRequestSchema, async (request: { params: { uri: string } }) => {
    const uri = request.params.uri

    const listMatch = uri.match(/^zen:\/\/content\/(\w+)$/)
    const itemMatch = uri.match(/^zen:\/\/content\/(\w+)\/(\d+)$/)

    if (listMatch) {
      const collection = listMatch[1]
      if (!MCP_COLLECTIONS.includes(collection as typeof MCP_COLLECTIONS[number])) {
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ error: `Unknown collection: ${collection}` }) }] }
      }
      try {
        const response = await strapiFetch(`/${collection}?pagination[limit]=50`)
        const body = await response.json() as { data?: unknown[] }
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(body.data ?? []) }] }
      } catch (err) {
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ error: (err as Error).message }) }] }
      }
    }

    if (itemMatch) {
      const collection = itemMatch[1]
      const id = itemMatch[2]
      if (!MCP_COLLECTIONS.includes(collection as typeof MCP_COLLECTIONS[number])) {
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ error: `Unknown collection: ${collection}` }) }] }
      }
      try {
        const response = await strapiFetch(`/${collection}/${id}`)
        const body = await response.json() as { data?: unknown }
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(body.data ?? null) }] }
      } catch (err) {
        return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ error: (err as Error).message }) }] }
      }
    }

    return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ error: `Unknown resource URI: ${uri}` }) }] }
  })

  return server
}

let state: McpServerState | null = null

export function getMcpState(): McpServerState {
  if (!state) {
    state = {
      server: createMcpServer(),
      transports: new Map(),
    }
  }
  return state
}

export async function handleMcpGet(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { server, transports } = getMcpState()
  const transport = new SSEServerTransport("/mcp/messages", res)
  const sid = transport.sessionId
  transports.set(sid, transport)
  res.on("close", () => {
    transports.delete(sid)
  })
  await server.connect(transport)
}

export async function handleMcpPost(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { transports } = getMcpState()
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`)
  const sessionId = url.searchParams.get("sessionId")

  if (!sessionId || !transports.has(sessionId)) {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "No active session" }))
    return
  }

  const transport = transports.get(sessionId)!
  await transport.handlePostMessage(req, res)
}
