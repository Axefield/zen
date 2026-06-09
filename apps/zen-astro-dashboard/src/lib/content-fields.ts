export interface FormField {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "date" | "datetime" | "select" | "boolean"
  required?: boolean
  options?: { value: string; label: string }[]
}

export const COLLECTION_LABELS: Record<string, string> = {
  articles: "Article",
  products: "Product",
  courses: "Course",
  events: "Event",
  pages: "Page",
}

export const FIELDS: Record<string, FormField[]> = {
  articles: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
    { name: "body", label: "Body", type: "textarea", required: true },
  ],
  products: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "title", label: "Title (for search)", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number", required: true },
    { name: "currency", label: "Currency", type: "text" },
    { name: "compareAtPrice", label: "Compare-at Price", type: "number" },
  ],
  courses: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "price", label: "Price", type: "number" },
    { name: "currency", label: "Currency", type: "text" },
  ],
  events: [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
    { name: "date", label: "Date", type: "datetime", required: true },
    {
      name: "locationType", label: "Location Type", type: "select",
      options: [
        { value: "physical", label: "Physical" },
        { value: "virtual", label: "Virtual" },
        { value: "hybrid", label: "Hybrid" },
      ],
    },
    { name: "address", label: "Address", type: "text" },
    { name: "virtualUrl", label: "Virtual URL", type: "text" },
    { name: "capacity", label: "Capacity", type: "number" },
  ],
  pages: [
    { name: "title", label: "Title", type: "text", required: true },
    {
      name: "visibility", label: "Visibility", type: "select",
      options: [
        { value: "public", label: "Public" },
        { value: "private", label: "Private" },
        { value: "unlisted", label: "Unlisted" },
      ],
    },
  ],
}
