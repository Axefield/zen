import { useState, useRef, useEffect } from "preact/hooks"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface Props {
  apiUrl: string
}

function getToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)zen_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function ChatInterface({ apiUrl }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [messages])

  async function handleSubmit(e: Event) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    setMessages((prev) => [...prev, { role: "user", content: text }])
    setInput("")
    setIsLoading(true)

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
      setMessages((prev) => [...prev, { role: "assistant", content: data.message.content }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${(err as Error).message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-output" ref={outputRef}>
        {messages.length === 0 && (
          <p className="chat-placeholder">Send a message to start the conversation.</p>
        )}
        {messages.map((msg, i) => (
          <div className={`message message-${msg.role}`} key={i}>
            <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
          </div>
        ))}
        {isLoading && <div className="message message-assistant"><em>Thinking...</em></div>}
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
  )
}
