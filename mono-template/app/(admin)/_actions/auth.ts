"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { randomUUID } from "crypto"
import { sign } from "./_utils"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { ADMIN_PREFIX } from "@/lib/admin-config"

export async function login(_prev: unknown, formData: FormData) {
  const forwardedFor = (await headers()).get("x-forwarded-for")
  const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown"

  const { data: rateLimitResult } = await supabaseAdmin.rpc("check_ip_rate_limit", {
    p_ip: clientIp,
    p_max_requests: 5,
    p_window_seconds: 300,
  })
  if (rateLimitResult?.allowed === false) {
    return { success: false, error: "Trop de tentatives. Réessayez dans 5 minutes." }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const validEmail = process.env.ADMIN_FAKE_EMAIL
  const validPassword = process.env.ADMIN_FAKE_PASSWORD

  if (!validEmail || !validPassword) {
    console.error("Admin credentials not configured in env")
    return { success: false, error: "Erreur de configuration" }
  }

  if (email !== validEmail || password !== validPassword) {
    return { success: false, error: "Identifiants incorrects" }
  }

  const sessionPayload = JSON.stringify({
    authenticated: true,
    jti: randomUUID(),
    loggedInAt: new Date().toISOString(),
  })

  const signedCookie = sign(sessionPayload)

  const cookieStore = await cookies()
  cookieStore.set("admin_session", signedCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: ADMIN_PREFIX,
    maxAge: 60 * 60 * 8,
  })

  redirect(`${ADMIN_PREFIX}/dashboard`)
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect(ADMIN_PREFIX)
}
