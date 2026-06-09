export type { BaseEntity } from "@truligon/types"

export type Role = "owner" | "admin" | "operator" | "viewer"

export interface Principal {
  id: string
  email: string
  roles: Role[]
}

export interface AuthSession {
  principalId: string
  token: string
  expiresAt: string
  roles: Role[]
}
