"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession, mapSupabaseError } from "./_utils"

const statusEnum = z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])

export async function listOrders() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, wilayas(name_ar, name_fr)")
    .order("created_at", { ascending: false })

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function getOrder(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*, wilayas(name_ar, name_fr)")
    .eq("id", id)
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function updateOrderStatus(id: string, status: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const parsed = statusEnum.safeParse(status)
  if (!parsed.success) return { error: "Statut invalide" }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: parsed.data })
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}

export async function deleteOrder(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin
    .from("orders")
    .delete()
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}
