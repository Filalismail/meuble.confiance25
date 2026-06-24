import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const SECRET_ENV = "ADMIN_COOKIE_SECRET"

function getSecret(): string {
  const secret = process.env[SECRET_ENV]
  if (!secret) throw new Error(`Missing ${SECRET_ENV} environment variable`)
  return secret
}

function b64encode(data: string): string {
  return Buffer.from(data, "utf-8").toString("base64")
}

function b64decode(data: string): string {
  return Buffer.from(data, "base64").toString("utf-8")
}

export function sign(payload: string): string {
  const encoded = b64encode(payload)
  const hmac = createHmac("sha256", getSecret())
  hmac.update(encoded)
  return encoded + "." + hmac.digest("hex")
}

export function verify(signed: string): string | null {
  const dot = signed.lastIndexOf(".")
  if (dot === -1) return null
  const encoded = signed.slice(0, dot)
  const signature = signed.slice(dot + 1)
  const expected = createHmac("sha256", getSecret()).update(encoded).digest("hex")
  try {
    if (timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return b64decode(encoded)
    }
  } catch {}
  return null
}

export interface AdminSession {
  authenticated: true
  loggedInAt: string
}

export async function verifyAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.get("admin_session")
    if (!cookie?.value) return null
    const raw = verify(cookie.value)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.authenticated !== true) return null
    const maxAge = 8 * 60 * 60 * 1000
    const loggedInAt = new Date(parsed.loggedInAt).getTime()
    if (Date.now() - loggedInAt > maxAge) return null
    return parsed as AdminSession
  } catch {
    return null
  }
}

export function unauthorizedResponse() {
  return { success: false, error: "Non autorisé" }
}
