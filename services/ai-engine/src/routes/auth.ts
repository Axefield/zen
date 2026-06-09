import { IncomingMessage, ServerResponse } from "node:http"
import { verifyPassword, signToken, verifyToken, findUserByEmail, findUserById, createUser, sanitizeUser } from "../auth.js"

export async function handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJson(req)
  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    json(res, 400, { error: "Email and password are required" })
    return
  }

  const user = findUserByEmail(email)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    json(res, 401, { error: "Invalid email or password" })
    return
  }

  const token = signToken(user)
  json(res, 200, {
    token,
    user: sanitizeUser(user),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  })
}

export async function handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body = await readJson(req)
  const { email, password, name } = body as { email?: string; password?: string; name?: string }

  if (!email || !password || !name) {
    json(res, 400, { error: "Email, password, and name are required" })
    return
  }
  if (password.length < 8) {
    json(res, 400, { error: "Password must be at least 8 characters" })
    return
  }

  try {
    const user = await createUser(email, password, name)
    const token = signToken(user)
    json(res, 201, {
      token,
      user: sanitizeUser(user),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (err) {
    json(res, 409, { error: (err as Error).message })
  }
}

export async function handleMe(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    json(res, 401, { error: "Authorization header required" })
    return
  }

  const payload = verifyToken(authHeader.slice(7))
  if (!payload) {
    json(res, 401, { error: "Invalid or expired token" })
    return
  }

  const user = findUserById(payload.id)
  if (!user) {
    json(res, 401, { error: "User not found" })
    return
  }

  json(res, 200, { user: sanitizeUser(user) })
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk: Buffer) => chunks.push(chunk))
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")))
      } catch {
        reject(new Error("Invalid JSON"))
      }
    })
    req.on("error", reject)
  })
}

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}
