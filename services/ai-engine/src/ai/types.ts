export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatResponse {
  message: ChatMessage
  model: string
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

export interface AiProvider {
  chat(req: ChatRequest): Promise<ChatResponse>
  name: string
}
