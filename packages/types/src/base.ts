export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export type EntityStatus = "draft" | "published" | "archived"

export type EntityVisibility = "public" | "private" | "unlisted"

export interface SeoMetadata {
  title: string
  description: string
  ogImage?: string
  canonicalUrl?: string
  noindex?: boolean
}

export interface DateRange {
  start: string
  end?: string
}

export interface Money {
  amount: number
  currency: string
}

export interface MediaRef {
  url: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  size?: number
}

export interface Address {
  line1: string
  line2?: string
  city: string
  region: string
  postalCode: string
  country: string
}
