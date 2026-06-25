import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_PREFIX =
  process.env.ADMIN_SECRET_PATH
    ? `/${process.env.ADMIN_SECRET_PATH}`
    : "/afa5e04feb3266f1"
const LOGIN_PATH = ADMIN_PREFIX

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https://upcrqpiotnrybbcazwso.supabase.co data: blob:",
    "connect-src 'self' https://upcrqpiotnrybbcazwso.supabase.co https://*.supabase.co",
    "font-src 'self' https://fonts.gstatic.com",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
  ].join("; ")
}

async function verifySessionCookie(value: string): Promise<boolean> {
  const dot = value.lastIndexOf(".")
  if (dot === -1) return false
  const encoded = value.slice(0, dot)
  const signature = value.slice(dot + 1)
  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const hmacBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(encoded))
  const expected = Array.from(new Uint8Array(hmacBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  if (signature.length !== expected.length) return false

  let result = 0
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  if (result !== 0) return false

  const raw = atob(encoded)
  try {
    const parsed = JSON.parse(raw)
    if (parsed?.authenticated !== true) return false
    const maxAge = 8 * 60 * 60 * 1000
    const loggedInAt = new Date(parsed.loggedInAt).getTime()
    if (isNaN(loggedInAt) || Date.now() - loggedInAt > maxAge) return false
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  response.headers.set("Content-Security-Policy", buildCsp(nonce))

  const { pathname } = request.nextUrl

  if (pathname.startsWith(ADMIN_PREFIX) && pathname !== LOGIN_PATH) {
    const sessionCookie = request.cookies.get("admin_session")
    if (!sessionCookie?.value || !(await verifySessionCookie(sessionCookie.value))) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }
  }

  return response
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}
