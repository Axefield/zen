import type { BaseEntity } from "../base.js"

export type AgentKind = "research" | "content" | "ux" | "product" | "analytics"

export type AgentRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled"

export type MemoryType = "session" | "episodic" | "semantic" | "procedural"

export interface AgentConfig extends BaseEntity {
  kind: AgentKind
  name: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  enabled: boolean
}

export interface AgentRun extends BaseEntity {
  agentConfigId: string
  input: string
  output?: string
  contextSources: string[]
  tokensUsed?: number
  cost?: number
  duration?: number
  status: AgentRunStatus
  error?: string
  triggeredBy?: string
}

export interface AgentMemory extends BaseEntity {
  agentConfigId: string
  type: MemoryType
  key: string
  value: string
  expiresAt?: string
}

export interface AgentWorkflow extends BaseEntity {
  kind: AgentKind
  inputs: string[]
  contextSources: string[]
  memorySources: string[]
  outputs: string[]
  validationProcess: string
}
