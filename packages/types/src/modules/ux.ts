import type { BaseEntity } from "../base.js"

export interface Persona extends BaseEntity {
  name: string
  title?: string
  role: string
  goals: string[]
  painPoints: string[]
  behaviors: string[]
  skills: string[]
  avatarUrl?: string
}

export interface Journey extends BaseEntity {
  name: string
  personaId: string
  stages: JourneyStage[]
  description?: string
}

export interface JourneyStage {
  name: string
  order: number
  description: string
  goals: string[]
  touchpoints: string[]
  emotions: string[]
}

export interface TaskFlow extends BaseEntity {
  name: string
  personaId: string
  steps: TaskStep[]
  description?: string
}

export interface TaskStep {
  order: number
  action: string
  decision?: string
  duration?: string
  systemInteraction?: string
}

export interface PainPoint extends BaseEntity {
  description: string
  severity: "low" | "medium" | "high" | "critical"
  frequency: "rare" | "occasional" | "frequent" | "always"
  personaId?: string
  journeyStage?: string
}
