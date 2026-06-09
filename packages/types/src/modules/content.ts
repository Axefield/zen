import type { BaseEntity, EntityStatus, EntityVisibility, SeoMetadata, Money, MediaRef } from "../base.js"

export interface Page extends BaseEntity {
  title: string
  slug: string
  components: ContentComponent[]
  seo?: SeoMetadata
  status: EntityStatus
  visibility: EntityVisibility
  publishedAt?: string
}

export interface ContentComponent {
  type: string
  props: Record<string, unknown>
  order: number
}

export interface Article extends BaseEntity {
  title: string
  slug: string
  excerpt: string
  body: string
  authorId?: string
  categoryIds: string[]
  tagIds: string[]
  seo?: SeoMetadata
  status: EntityStatus
  publishedAt?: string
  featuredImage?: MediaRef
}

export interface Campaign extends BaseEntity {
  title: string
  slug: string
  goal: Money
  raised: Money
  startDate: string
  endDate?: string
  tiers: CampaignTier[]
  status: EntityStatus
  seo?: SeoMetadata
}

export interface CampaignTier {
  name: string
  amount: Money
  description: string
  maxBackers?: number
}

export interface Product extends BaseEntity {
  name: string
  slug: string
  description: string
  price: Money
  compareAtPrice?: Money
  variantIds: string[]
  media: MediaRef[]
  status: EntityStatus
  seo?: SeoMetadata
}

export interface Artwork extends BaseEntity {
  title: string
  slug: string
  description: string
  media: MediaRef[]
  license?: string
  price?: Money
  artistId?: string
  status: EntityStatus
  seo?: SeoMetadata
}

export interface Faq extends BaseEntity {
  question: string
  answer: string
  categoryId?: string
  order: number
  searchWeight: number
}

export interface Course extends BaseEntity {
  title: string
  slug: string
  description: string
  modules: CourseModule[]
  price?: Money
  instructorId?: string
  status: EntityStatus
  publishedAt?: string
  seo?: SeoMetadata
}

export interface CourseModule {
  name: string
  order: number
  lessons: Lesson[]
}

export interface Lesson {
  title: string
  description: string
  videoUrl?: string
  duration?: number
  order: number
}

export interface Event extends BaseEntity {
  title: string
  slug: string
  description: string
  date: string
  location: EventLocation
  capacity?: number
  ticketTiers: TicketTier[]
  status: EntityStatus
  seo?: SeoMetadata
}

export interface EventLocation {
  type: "physical" | "virtual" | "hybrid"
  address?: string
  virtualUrl?: string
}

export interface TicketTier {
  name: string
  price: Money
  capacity?: number
  description: string
}
