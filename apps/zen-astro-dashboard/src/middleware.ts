import { defineMiddleware } from "astro:middleware"

const API_URL = process.env.INTERNAL_API_URL ?? "http://ai-engine:4000"
const PUBLIC_ROUTES = ["/login"]

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 1,
  operator: 2,
  admin: 3,
  owner: 4,
}

const ROUTE_ROLES: Record<string, string> = {
  "/agents": "operator",
  "/content": "operator",
  "/experiments": "operator",
  "/analytics": "viewer",
}

function hasMinRole(userRole: string, minRole: string): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[minRole] ?? 99)
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies } = context

  if (PUBLIC_ROUTES.includes(url.pathname)) {
    return next()
  }

  const token = cookies.get("zen_token")?.value
  if (!token) {
    if (url.pathname.startsWith("/api")) return next()
    return Response.redirect(new URL("/login", url))
  }

  let user: { id: string; email: string; name: string; role: string } | null = null
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      user = data.user
      context.locals.user = user
    } else {
      cookies.delete("zen_token", { path: "/" })
      return Response.redirect(new URL("/login", url))
    }
  } catch {
    return Response.redirect(new URL("/login", url))
  }

  for (const [prefix, minRole] of Object.entries(ROUTE_ROLES)) {
    if (url.pathname.startsWith(prefix)) {
      if (!hasMinRole(user!.role, minRole)) {
        return new Response("Forbidden", { status: 403 })
      }
      break
    }
  }

  const response = await next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
})
