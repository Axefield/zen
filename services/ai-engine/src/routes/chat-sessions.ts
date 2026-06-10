import { IncomingMessage, ServerResponse } from "node:http"
import { verifyToken } from "../auth.js"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatSession {
  id: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  syncedAt?: string
}

const sessions = new Map<string, ChatSession>()

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")))
      } catch {
        reject(new Error("Invalid JSON"))
      }
    })
    req.on("error", reject)
  })
}

function getUserId(req: IncomingMessage): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) return null
  const payload = verifyToken(authHeader.slice(7))
  return payload?.id ?? null
}

export async function handleListSessions(req: IncomingMessage, res: ServerResponse) {
  const userId = getUserId(req)
  if (!userId) {
    json(res, 401, { error: "Unauthorized" })
    return
  }
  const prefix = `${userId}::`
  const userSessions = Array.from(sessions.values())
    .filter((s) => s.id.startsWith(prefix))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  json(res, 200, userSessions)
}

export async function handleCreateSession(req: IncomingMessage, res: ServerResponse) {
  const userId = getUserId(req)
  if (!userId) {
    json(res, 401, { error: "Unauthorized" })
    return
  }
  try {
    const body = await readJson(req) as ChatSession
    const session: ChatSession = {
      ...body,
      id: `${userId}::${body.id}`,
    }
    sessions.set(session.id, session)
    json(res, 201, session)
  } catch (err) {
    json(res, 400, { error: (err as Error).message })
  }
}

export async function handleUpdateSession(req: IncomingMessage, res: ServerResponse, id: string) {
  const userId = getUserId(req)
  if (!userId) {
    json(res, 401, { error: "Unauthorized" })
    return
  }
  const fullId = `${userId}::${id}`
  const existing = sessions.get(fullId)
  if (!existing) {
    json(res, 404, { error: "Session not found" })
    return
  }
  try {
    const body = await readJson(req) as Partial<ChatSession>
    const updated: ChatSession = { ...existing, ...body, id: fullId }
    sessions.set(fullId, updated)
    json(res, 200, updated)
  } catch (err) {
    json(res, 400, { error: (err as Error).message })
  }
}

export async function handleDeleteSession(req: IncomingMessage, res: ServerResponse, id: string) {
  const userId = getUserId(req)
  if (!userId) {
    json(res, 401, { error: "Unauthorized" })
    return
  }
  const fullId = `${userId}::${id}`
  sessions.delete(fullId)
  res.writeHead(204)
  res.end()
}
