import type {
  AgentKind,
  AgentRunStatus,
  MemoryType,
  AgentConfig,
  AgentRun,
  AgentMemory,
  AgentWorkflow,
  BaseEntity,
} from "@truligon/types"

export type { AgentKind, AgentRunStatus, MemoryType, AgentConfig, AgentRun, AgentMemory, AgentWorkflow } from "@truligon/types"
export type { BaseEntity } from "@truligon/types"

// ─── AI Provider Contracts ──────────────────────────

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

// ─── Provider Registry ──────────────────────────────

const providers = new Map<string, () => AiProvider>()

export function getAiProvider(name?: string): AiProvider {
  const providerName = name ?? process.env.AI_PROVIDER ?? "ollama"
  const factory = providers.get(providerName)
  if (!factory) {
    throw new Error(`Unknown AI provider: "${providerName}". Available: ${[...providers.keys()].join(", ")}`)
  }
  return factory()
}

export function registerProvider(name: string, factory: () => AiProvider): void {
  providers.set(name, factory)
}
