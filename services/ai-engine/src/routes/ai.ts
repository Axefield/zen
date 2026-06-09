import { IncomingMessage, ServerResponse } from "node:http"
import { getAiProvider } from "../ai/index.js"

export async function handleChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await readJson(req)
    const { messages, model, temperature, maxTokens } = body as {
      messages?: { role: string; content: string }[]
      model?: string
      temperature?: number
      maxTokens?: number
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      json(res, 400, { error: "Messages array is required" })
      return
    }

    const provider = getAiProvider()
    const result = await provider.chat({
      messages: messages.map((m) => ({ role: m.role as "system" | "user" | "assistant", content: m.content })),
      model,
      temperature,
      maxTokens,
    })

    json(res, 200, result)
  } catch (err) {
    json(res, 500, { error: (err as Error).message })
  }
}

export async function handleModels(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const provider = getAiProvider()
  json(res, 200, {
    provider: provider.name,
    models: [process.env.OLLAMA_MODEL ?? "llama3.2"],
  })
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

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}
