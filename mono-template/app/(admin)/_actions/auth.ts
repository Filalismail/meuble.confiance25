"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sign } from "./_utils"

export async function login(_prev: unknown, formData: FormData) {
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
    loggedInAt: new Date().toISOString(),
  })

  const signedCookie = sign(sessionPayload)

  const cookieStore = await cookies()
  cookieStore.set("admin_session", signedCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/afa5e04feb3266f1",
    maxAge: 60 * 60 * 8,
  })

  redirect("/afa5e04feb3266f1/dashboard")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  redirect("/afa5e04feb3266f1")
}
