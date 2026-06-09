import type { BaseEntity } from "../base.js"

export type ComponentStatus = "draft" | "ready" | "deprecated"

export type TokenCategory = "color" | "typography" | "spacing" | "layout" | "shadow" | "radius" | "transition"

export interface DesignToken extends BaseEntity {
  name: string
  value: string
  category: TokenCategory
  description?: string
}

export interface Typography extends BaseEntity {
  family: string
  weight: number
  size: string
  lineHeight: string
  letterSpacing?: string
  category: "display" | "heading" | "body" | "small" | "caption"
}

export interface Color extends BaseEntity {
  name: string
  hex: string
  rgb?: string
  hsl?: string
  purpose: string
  category: "primary" | "neutral" | "success" | "warning" | "error" | "info"
}

export interface Icon extends BaseEntity {
  name: string
  category: string
  tags: string[]
  svgContent?: string
}

export interface Layout extends BaseEntity {
  name: string
  description: string
  regions: string[]
  template?: string
}

export interface ComponentSpec extends BaseEntity {
  name: string
  description: string
  status: ComponentStatus
  category: string
  props: string[]
  dependencies: string[]
}
