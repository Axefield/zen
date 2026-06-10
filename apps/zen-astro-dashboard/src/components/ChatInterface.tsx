import { useState, useRef, useEffect } from "preact/hooks"
import type { ChatMessage, ChatSession } from "../lib/chat-store"
import {
  listSessions,
  getSession,
  saveSession,
  deleteSession as deleteSessionFromStore,
  createSession,
  syncSessionsWithServer,
  pushSessionToServer,
} from "../lib/chat-store"

interface Props {
  apiUrl: string
}

function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)zen_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function ChatInterface({ apiUrl }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = getToken()
    ;(async () => {
      await syncSessionsWithServer(apiUrl, token)
      const all = await listSessions()
      setSessions(all)
      if (all.length > 0) {
        setActiveId(all[0].id)
        setMessages(all[0].messages)
      }
    })()
  }, [])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [messages])

  async function switchSession(id: string) {
    const session = await getSession(id)
    if (session) {
      setActiveId(id)
      setMessages(session.messages)
    }
  }

  async function handleNewChat() {
    const session = await createSession()
    setSessions((prev) => [session, ...prev])
    setActiveId(session.id)
    setMessages([])
  }

  async function persistMessages(
    id: string,
    msgs: ChatMessage[]
  ) {
    const existing = await getSession(id)
    if (!existing) return
    const now = new Date()
    const title =
      existing.title === "New Chat" && msgs.length > 0
        ? msgs[0].content.slice(0, 60)
        : existing.title
    const updated: ChatSession = {
      ...existing,
      title,
      messages: msgs,
      updatedAt: now,
    }
    await saveSession(updated)
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? updated : s))
    )
    const token = getToken()
    pushSessionToServer(apiUrl, token, updated)
  }

  async function handleSubmit(e: Event) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    let id = activeId
    if (!id) {
      const session = await createSession()
      setSessions((prev) => [session, ...prev])
      setActiveId(session.id)
      id = session.id
    }

    const userMsg: ChatMessage = { role: "user", content: text }
    const newMsgs = [...messages, userMsg]
    setMessages(newMsgs)
    setInput("")
    setIsLoading(true)
    await persistMessages(id!, newMsgs)

    const token = getToken()
    try {
      const res = await fetch(`${apiUrl}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as Record<string, unknown>).error as string ?? "Request failed")
      }

      const data = await res.json() as { message: { content: string } }
      const assistantMsg: ChatMessage = { role: "assistant", content: data.message.content }
      const finalMsgs = [...newMsgs, assistantMsg]
      setMessages(finalMsgs)
      await persistMessages(id!, finalMsgs)
    } catch (err) {
      const errorMsg: ChatMessage = { role: "assistant", content: `Error: ${(err as Error).message}` }
      const finalMsgs = [...newMsgs, errorMsg]
      setMessages(finalMsgs)
      await persistMessages(id!, finalMsgs)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteSession(id: string) {
    await deleteSessionFromStore(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    if (activeId === id) {
      const remaining = sessions.filter((s) => s.id !== id)
      if (remaining.length > 0) {
        setActiveId(remaining[0].id)
        switchSession(remaining[0].id)
      } else {
        setActiveId(null)
        setMessages([])
      }
    }
    const token = getToken()
    if (token) {
      try {
        await fetch(`${apiUrl}/api/chat/sessions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch { /* skip */ }
    }
  }

  const activeTitle = sessions.find((s) => s.id === activeId)?.title ?? ""

  return (
    <div className={`chat-interface ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          <button
            className="toggle-sidebar-btn"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            ◀
          </button>
        </div>
        <div className="session-list">
          {sessions.length === 0 && (
            <p className="session-list-empty">No conversations yet</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`session-item ${s.id === activeId ? "active" : ""}`}
              onClick={() => switchSession(s.id)}
            >
              <div className="session-title">{s.title}</div>
              <div className="session-meta">
                {s.messages.length} message{s.messages.length !== 1 ? "s" : ""}
              </div>
              <button
                className="session-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteSession(s.id)
                }}
                title="Delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-topbar">
          {!sidebarOpen && (
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              ▶
            </button>
          )}
          <span className="chat-title">{activeTitle}</span>
        </div>

        <div className="chat-output" ref={outputRef}>
          {messages.length === 0 && (
            <p className="chat-placeholder">
              Send a message to start the conversation.
            </p>
          )}
          {messages.map((msg, i) => (
            <div className={`message message-${msg.role}`} key={i}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="message message-assistant">
              <em>Thinking...</em>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e as unknown as Event) }} className="chat-form">
          <div className="input-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask something..."
              value={input}
              onInput={(e) => setInput((e.target as HTMLInputElement).value)}
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
