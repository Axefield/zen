import { AiProvider, ChatMessage, ChatRequest, ChatResponse } from "./types.js"

interface OllamaChatRequest {
  model: string
  messages: { role: string; content: string }[]
  stream: boolean
  options?: {
    temperature?: number
    num_predict?: number
  }
}

interface OllamaChatResponse {
  model: string
  message: { role: string; content: string }
  done: boolean
  prompt_eval_count?: number
  eval_count?: number
}

export class OllamaProvider implements AiProvider {
  name = "ollama"

  private baseUrl: string
  private defaultModel: string

  constructor(baseUrl?: string, defaultModel?: string) {
    this.baseUrl = baseUrl ?? process.env.OLLAMA_URL ?? "http://host.docker.internal:11434"
    this.defaultModel = defaultModel ?? process.env.OLLAMA_MODEL ?? "llama3.2"
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const model = req.model ?? this.defaultModel

    const body: OllamaChatRequest = {
      model,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
      stream: false,
      options: {
        temperature: req.temperature,
        num_predict: req.maxTokens,
      },
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Ollama error (${res.status}): ${text}`)
    }

    const data = (await res.json()) as OllamaChatResponse

    return {
      message: {
        role: data.message.role as "assistant",
        content: data.message.content,
      },
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count ?? 0,
        completionTokens: data.eval_count ?? 0,
        totalTokens: (data.prompt_eval_count ?? 0) + (data.eval_count ?? 0),
      },
    }
  }
}
