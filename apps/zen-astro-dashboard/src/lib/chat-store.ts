import Dexie, { type EntityTable } from "dexie"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatSession {
  id: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  syncedAt?: Date
}

const db = new Dexie("ZenChat") as Dexie & {
  sessions: EntityTable<ChatSession, "id">
}

db.version(1).stores({
  sessions: "id, updatedAt, createdAt",
})

export async function listSessions(): Promise<ChatSession[]> {
  return db.sessions.orderBy("updatedAt").reverse().toArray()
}

export async function getSession(id: string): Promise<ChatSession | undefined> {
  return db.sessions.get(id)
}

export async function saveSession(session: ChatSession): Promise<void> {
  await db.sessions.put(session)
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id)
}

export async function createSession(
  overrides: Partial<ChatSession> = {}
): Promise<ChatSession> {
  const now = new Date()
  const session: ChatSession = {
    id: crypto.randomUUID(),
    title: "New Chat",
    model: "llama3.2",
    messages: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
  await db.sessions.add(session)
  return session
}

export async function syncSessionsWithServer(
  apiUrl: string,
  token: string | null
): Promise<void> {
  if (!token) return
  try {
    const res = await fetch(`${apiUrl}/api/chat/sessions`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) return
    const serverSessions = (await res.json()) as ChatSession[]
    const localSessions = await listSessions()
    const localMap = new Map(localSessions.map((s) => [s.id, s]))
    for (const ss of serverSessions) {
      const local = localMap.get(ss.id)
      if (!local || new Date(ss.updatedAt) > new Date(local.updatedAt)) {
        await saveSession(ss)
      }
    }
    for (const ls of localSessions) {
      if (!ls.syncedAt || new Date(ls.updatedAt) > new Date(ls.syncedAt)) {
        await pushSessionToServer(apiUrl, token, ls)
      }
    }
  } catch {
    // offline, skip sync
  }
}

export async function pushSessionToServer(
  apiUrl: string,
  token: string | null,
  session: ChatSession
): Promise<void> {
  if (!token) return
  try {
    const method = session.syncedAt ? "PUT" : "POST"
    const url =
      method === "PUT"
        ? `${apiUrl}/api/chat/sessions/${session.id}`
        : `${apiUrl}/api/chat/sessions`
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(session),
    })
    if (res.ok) {
      session.syncedAt = new Date()
      await saveSession(session)
    }
  } catch {
    // offline, skip
  }
}
