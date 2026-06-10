import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET ?? "zen-dev-jwt-secret"
const TOKEN_EXPIRY = "24h"

export type SystemRole = "owner" | "admin" | "operator" | "viewer"

const ROLE_HIERARCHY: Record<SystemRole, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
  owner: 4,
}

export function hasMinRole(userRole: SystemRole, minRole: SystemRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

export interface UserRecord {
  id: string
  email: string
  name: string
  role: SystemRole
  isActive: boolean
  passwordHash: string
  createdAt: string
  updatedAt: string
}

const users: UserRecord[] = []

export async function seedDefaultUser(): Promise<void> {
  if (users.length > 0) return
  const passwordHash = await bcrypt.hash("admin123", 10)
  users.push({
    id: "user-seed-001",
    email: "admin@truligon.io",
    name: "Admin User",
    role: "admin",
    isActive: true,
    passwordHash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  console.log("Seeded default admin user: admin@truligon.io / admin123")
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(user: { id: string; email: string; role: SystemRole }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): { id: string; email: string; role: SystemRole } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: SystemRole }
  } catch {
    return null
  }
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return users.find((u) => u.email === email && u.isActive)
}

export function findUserById(id: string): UserRecord | undefined {
  return users.find((u) => u.id === id && u.isActive)
}

export function createUser(email: string, password: string, name: string, role: SystemRole = "operator"): Promise<UserRecord> {
  return (async () => {
    const existing = findUserByEmail(email)
    if (existing) throw new Error("Email already registered")
    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()
    const user: UserRecord = {
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      email,
      name,
      role,
      isActive: true,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    }
    users.push(user)
    return user
  })()
}

export function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
