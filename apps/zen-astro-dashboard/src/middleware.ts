import { defineMiddleware } from "astro:middleware"

const API_URL = process.env.INTERNAL_API_URL ?? "http://ai-engine:4000"
const PUBLIC_ROUTES = ["/login"]

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

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json() as { user: { id: string; email: string; name: string; role: string } }
      context.locals.user = data.user
    } else {
      cookies.delete("zen_token", { path: "/" })
      return Response.redirect(new URL("/login", url))
    }
  } catch {
    return Response.redirect(new URL("/login", url))
  }

  const response = await next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
})
