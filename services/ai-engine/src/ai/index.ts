import { AiProvider } from "./types.js"
import { OllamaProvider } from "./ollama.js"

const providers = new Map<string, () => AiProvider>()

providers.set("ollama", () => new OllamaProvider())

export function getAiProvider(name?: string): AiProvider {
  const providerName = name ?? process.env.AI_PROVIDER ?? "ollama"
  const factory = providers.get(providerName)
  if (!factory) {
    throw new Error(`Unknown AI provider: ${providerName}. Available: ${[...providers.keys()].join(", ")}`)
  }
  return factory()
}

export function registerProvider(name: string, factory: () => AiProvider): void {
  providers.set(name, factory)
}

export type { AiProvider } from "./types.js"
export type { ChatMessage, ChatRequest, ChatResponse } from "./types.js"
