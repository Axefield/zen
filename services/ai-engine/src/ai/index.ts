export { getAiProvider, registerProvider } from "@truligon/ai"
export type { AiProvider, ChatMessage, ChatRequest, ChatResponse } from "@truligon/ai"

import { registerProvider } from "@truligon/ai"
import { OllamaProvider } from "./ollama.js"

registerProvider("ollama", () => new OllamaProvider())
