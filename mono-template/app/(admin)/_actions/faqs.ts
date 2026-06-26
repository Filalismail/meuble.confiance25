"use server"

import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { verifyAdminSession, mapSupabaseError } from "./_utils"

const FaqSchema = z.object({
  questionAr: z.string().min(1, "Requis"),
  questionFr: z.string().min(1, "Requis"),
  answerAr: z.string().min(1, "Requis"),
  answerFr: z.string().min(1, "Requis"),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()),
})

export async function listFaqs() {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function getFaq(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .select("*")
    .eq("id", id)
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function createFaq(formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = FaqSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { data, error } = await supabaseAdmin
    .from("faqs")
    .insert({
      question_ar: parsed.data.questionAr,
      question_fr: parsed.data.questionFr,
      answer_ar: parsed.data.answerAr,
      answer_fr: parsed.data.answerFr,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single()

  if (error) return { error: mapSupabaseError(error) }
  return { data }
}

export async function updateFaq(id: string, formData: FormData) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const raw = Object.fromEntries(formData)
  const parsed = FaqSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const { error } = await supabaseAdmin
    .from("faqs")
    .update({
      question_ar: parsed.data.questionAr,
      question_fr: parsed.data.questionFr,
      answer_ar: parsed.data.answerAr,
      answer_fr: parsed.data.answerFr,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}

export async function deleteFaq(id: string) {
  const session = await verifyAdminSession()
  if (!session) return { error: "Non autorisé" }

  const { error } = await supabaseAdmin
    .from("faqs")
    .delete()
    .eq("id", id)

  if (error) return { error: mapSupabaseError(error) }
  return { success: true }
}
