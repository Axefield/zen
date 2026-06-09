export interface DynamicBlock {
  __component: string
  id: number
  [key: string]: unknown
}

export interface MediaItem {
  url: string
  alternativeText?: string
  formats?: Record<string, { url: string }>
}
