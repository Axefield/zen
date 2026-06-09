import { Meilisearch } from "meilisearch";

const MEILI_HOST = process.env.MEILISEARCH_HOST ?? "http://localhost:7700";
const MEILI_KEY = process.env.MEILISEARCH_API_KEY ?? "";

const client = new Meilisearch({ host: MEILI_HOST, apiKey: MEILI_KEY });

const INDEXES = ["articles", "products", "courses", "events"] as const;
type Collection = (typeof INDEXES)[number];

export interface IndexableDocument {
  id: number;
  title?: string;
  name?: string;
  slug: string;
  excerpt?: string;
  description?: string;
  body?: string;
  content?: string;
  [key: string]: unknown;
}

function extractText(doc: IndexableDocument): string {
  const parts: string[] = [];
  if (doc.title) parts.push(doc.title);
  if (doc.name) parts.push(doc.name);
  if (doc.excerpt) parts.push(doc.excerpt);
  if (doc.description) {
    parts.push(doc.description.replace(/<[^>]*>/g, "").replace(/#{1,6}\s/g, ""));
  }
  if (doc.body) {
    parts.push(doc.body.replace(/<[^>]*>/g, "").replace(/#{1,6}\s/g, ""));
  }
  if (doc.content) {
    parts.push(doc.content.replace(/<[^>]*>/g, "").replace(/#{1,6}\s/g, ""));
  }
  return parts.join(" ").trim();
}

function toSearchDocument(collection: Collection, doc: IndexableDocument) {
  return {
    id: `${collection}_${doc.id}`,
    collection,
    title: doc.title ?? doc.name ?? "",
    slug: doc.slug,
    text: extractText(doc),
    createdAt: new Date().toISOString(),
  };
}

export async function indexDocument(collection: Collection, doc: IndexableDocument): Promise<void> {
  const index = client.index(collection);
  const searchDoc = toSearchDocument(collection, doc);
  await index.addDocuments([searchDoc]);
  console.log(`Indexed ${collection}/${doc.id} (${searchDoc.title})`);
}

export async function removeDocument(collection: Collection, id: number): Promise<void> {
  const index = client.index(collection);
  const documentId = `${collection}_${id}`;
  await index.deleteDocument(documentId);
  console.log(`Removed ${collection}/${id} from index`);
}

export async function search(query: string, collection?: string) {
  const collections = collection ? [collection] : INDEXES;
  const results = await Promise.all(
    collections.map(async (c) => {
      const index = client.index(c);
      const res = await index.search(query, { limit: 20 });
      return {
        collection: c,
        hits: res.hits,
        total: res.estimatedTotalHits ?? 0,
      };
    })
  );
  return results.filter((r) => r.total > 0);
}

export async function getIndexStats() {
  const stats: Record<string, { documentCount: number; fields: Record<string, unknown> }> = {};
  for (const c of INDEXES) {
    try {
      const index = client.index(c);
      const [s, fields] = await Promise.all([
        index.getStats(),
        index.getFilterableAttributes(),
      ]);
      stats[c] = { documentCount: s.numberOfDocuments, fields: { filterable: fields } };
    } catch {
      stats[c] = { documentCount: 0, fields: {} };
    }
  }
  return stats;
}

export async function isHealthy(): Promise<boolean> {
  try {
    await client.health();
    return true;
  } catch {
    return false;
  }
}
