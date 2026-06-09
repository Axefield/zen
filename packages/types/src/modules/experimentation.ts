import type { BaseEntity, DateRange } from "../base.js"

export interface Hypothesis extends BaseEntity {
  title: string
  description: string
  metricId: string
  expectedOutcome: string
  reasoning: string
}

export interface Experiment extends BaseEntity {
  hypothesisId: string
  name: string
  status: "draft" | "running" | "paused" | "completed" | "cancelled"
  variants: Variant[]
  dateRange: DateRange
  results?: ExperimentResult
}

export interface Variant {
  name: string
  description: string
  config: Record<string, unknown>
  trafficWeight: number
}

export interface ExperimentResult {
  winner?: string
  confidence: number
  metrics: Record<string, VariantMetric>
  concludedAt: string
}

export interface VariantMetric {
  value: number
  sampleSize: number
  improvement?: number
  significant: boolean
}

export interface FeatureFlag extends BaseEntity {
  key: string
  description: string
  enabled: boolean
  variants: FlagVariant[]
  targetingRules: TargetingRule[]
}

export interface FlagVariant {
  name: string
  config: Record<string, unknown>
  weight: number
}

export interface TargetingRule {
  attribute: string
  operator: "eq" | "neq" | "in" | "not_in" | "gt" | "lt" | "contains"
  value: unknown
}
