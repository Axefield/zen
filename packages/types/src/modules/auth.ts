import type { BaseEntity } from "../base.js"

export type SystemRole = "owner" | "admin" | "operator" | "viewer"

export interface User extends BaseEntity {
  email: string
  name: string
  role: SystemRole
  isActive: boolean
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresAt: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}
