import type { SystemRole, User, RegisterRequest } from "@truligon/types"

// Re-export canonical types from @truligon/types
export type { SystemRole, User, AuthSession, LoginRequest, LoginResponse, RegisterRequest } from "@truligon/types"
export { SystemRoleSchema, UserSchema, AuthSessionSchema, LoginRequestSchema, LoginResponseSchema, RegisterRequestSchema } from "@truligon/types"

// Storage form — includes password hash, never exposed to API responses
export interface UserRecord extends User {
  passwordHash: string
}

// JWT payload embedded in tokens
export interface JwtPayload {
  id: string
  email: string
  role: SystemRole
}

// Auth store contract — implement this to persist users
export interface AuthStore {
  findUserByEmail(email: string): Promise<UserRecord | undefined>
  findUserById(id: string): Promise<UserRecord | undefined>
  createUser(input: RegisterRequest, role?: SystemRole): Promise<UserRecord>
  seedDefaultUser(): Promise<void>
}

// Token service contract — implement this for JWT management
export interface TokenService {
  sign(payload: JwtPayload): string
  verify(token: string): JwtPayload | null
}

// Password service contract — implement this for password hashing
export interface PasswordService {
  hash(password: string): Promise<string>
  verify(password: string, hash: string): Promise<boolean>
}

// Role hierarchy (higher number = more privilege)
const ROLE_HIERARCHY: Record<SystemRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
  owner: 4,
}

export function hasMinRole(userRole: SystemRole, minRole: SystemRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

// Strip password hash for API responses
export function sanitizeUser(user: UserRecord): User {
  const { passwordHash: _unused, ...safe } = user
  return safe
}
