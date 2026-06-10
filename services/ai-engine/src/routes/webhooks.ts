import { IncomingMessage, ServerResponse } from "node:http"
import { indexDocument, removeDocument, IndexableDocument } from "../search.js"

const COLLECTION_MAP: Record<string, string> = {
  "api::article.article": "articles",
  "api::product.product": "products",
  "api::course.course": "courses",
  "api::event.event": "events",
  "api::page.page": "pages",
}

function getCollection(uid: string): string | undefined {
  return COLLECTION_MAP[uid]
}

interface StrapiWebhookPayload {
  event: string
  model: string
  uid: string
  entry: Record<string, unknown> & { id: number }
}

export async function handleStrapiWebhook(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readBody(req)
  const payload: StrapiWebhookPayload = JSON.parse(body)
  const { event, uid, entry } = payload

  const collection = getCollection(uid)
  if (!collection) {
    json(res, 200, { ignored: true, reason: `Unknown uid: ${uid}` })
    return
  }

  if (event === "entry.delete" || event === "entry.unpublish") {
    await removeDocument(collection as "articles" | "products" | "courses" | "events", entry.id)
    console.log(`[webhook] Removed ${collection}/${entry.id} (${event})`)
    json(res, 200, { removed: true, collection, id: entry.id, event })
    return
  }

  if (event === "entry.create" || event === "entry.update" || event === "entry.publish") {
    await indexDocument(collection as "articles" | "products" | "courses" | "events", entry as IndexableDocument)
    console.log(`[webhook] Indexed ${collection}/${entry.id} (${event})`)
    json(res, 200, { indexed: true, collection, id: entry.id, event })
    return
  }

  json(res, 200, { ignored: true, event })
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString("utf-8")
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}
