import type { BaseEntity, DateRange } from "../base.js"

export type MetricCategory = "business" | "product" | "system"

export type MetricAggregation = "sum" | "avg" | "count" | "min" | "max" | "p50" | "p95" | "p99"

export interface Metric extends BaseEntity {
  name: string
  category: MetricCategory
  description: string
  unit: string
  aggregation: MetricAggregation
  query?: string
}

export interface MetricEvent extends BaseEntity {
  name: string
  properties: Record<string, unknown>
  userId?: string
  sessionId?: string
  timestamp: string
  source: string
}

export interface Report extends BaseEntity {
  name: string
  description: string
  metrics: string[]
  dateRange: DateRange
  filters: Record<string, unknown>
  createdBy: string
}

export interface Dashboard extends BaseEntity {
  name: string
  description: string
  widgets: DashboardWidget[]
  layout: Record<string, unknown>
  createdBy: string
}

export interface DashboardWidget {
  type: string
  title: string
  metricIds: string[]
  position: { x: number; y: number; w: number; h: number }
  config: Record<string, unknown>
}

export interface ConversionFunnel extends BaseEntity {
  name: string
  steps: FunnelStep[]
  attribution: "first" | "last" | "linear"
}

export interface FunnelStep {
  name: string
  event: string
  order: number
  description?: string
}
