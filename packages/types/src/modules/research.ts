import type { BaseEntity, EntityStatus } from "../base.js"

export interface Competitor extends BaseEntity {
  name: string
  website?: string
  description?: string
  marketPosition?: string
  strengths: string[]
  weaknesses: string[]
  lastAnalyzedAt?: string
}

export interface ResearchItem extends BaseEntity {
  title: string
  url?: string
  source: string
  summary: string
  tags: string[]
  relevanceScore?: number
  status: EntityStatus
}

export interface Opportunity extends BaseEntity {
  title: string
  description: string
  estimatedImpact: "low" | "medium" | "high"
  effort: "low" | "medium" | "high"
  timeframe?: string
  status: "identified" | "evaluating" | "pursuing" | "completed" | "declined"
}

export interface Interview extends BaseEntity {
  subject: string
  date: string
  summary: string
  keyInsights: string[]
  transcriptUrl?: string
  tags: string[]
}

export interface Keyword extends BaseEntity {
  term: string
  searchVolume?: number
  difficulty?: number
  relevance?: number
  module?: string
  lastUpdated?: string
}

export interface Trend extends BaseEntity {
  name: string
  description: string
  category: string
  momentum: "rising" | "stable" | "declining"
  sources: string[]
  firstDetectedAt: string
}
