import type { Product, Category, OptionsGroup, OptionsGroupEntry } from "@/lib/types"
import { fetchCategoryBySlug, fetchProductsByCategorySlug, fetchCategories, fetchAllProducts } from "@/lib/data"

export type { Product, Category, OptionsGroup, OptionsGroupEntry }

const STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
  : "https://upcrqpiotnrybbcazwso.supabase.co/storage/v1/object/public"

const S = STORAGE_URL

const fallbackCategories: Category[] = [
  { id: "1", slug: "chambres-a-coucher-principales", nameAr: "غرف نوم أساسية", nameFr: "Chambres à Coucher Principales", image: `${S}/main-bedroom/main-bedroom.jpg`, gradient: "from-[#F5F0EB] to-[#E8DFD3]", isActive: true, sortOrder: 1 },
  { id: "2", slug: "chambres-a-coucher-enfants",     nameAr: "غرف نوم أطفال",   nameFr: "Chambres à Coucher Enfants",      image: `${S}/kids-bedroom/kids-bedroom.jpg`, gradient: "from-[#EDF1F5] to-[#D6E0E8]", isActive: true, sortOrder: 2 },
  { id: "3", slug: "salons",                          nameAr: "صالونات",         nameFr: "Salons",                          image: `${S}/salons/salons.jpg`, gradient: "from-[#F0EDE8] to-[#DFD9D0]", isActive: true, sortOrder: 3 },
  { id: "4", slug: "salle-a-manger",                  nameAr: "طاولة الأكل",     nameFr: "Salle à manger",                  image: `${S}/salle-a-manger/salle-a-manger.jpg`, gradient: "from-[#EFE7DE] to-[#DACCC0]", isActive: true, sortOrder: 4 },
  { id: "5", slug: "matelas-literie",                 nameAr: "أفرشة",           nameFr: "Matelas & Literie",               image: `${S}/matelas/matelas.jpg`, gradient: "from-[#F4F0ED] to-[#E3DCD4]", isActive: true, sortOrder: 5 },
  { id: "6", slug: "horloges-murales",                nameAr: "ساعات حائط",      nameFr: "Horloges Murales",                image: `${S}/horloges/horloges.jpg`, gradient: "from-[#E8E6E4] to-[#D2CEC8]", isActive: true, sortOrder: 6 },
  { id: "7", slug: "armoires-dressings",              nameAr: "الخزائن",          nameFr: "Armoires & Dressings",            image: `${S}/armoires/armoires.jpg`, gradient: "from-[#EFECE7] to-[#DBD4CA]", isActive: true, sortOrder: 7 },
]

export async function getCategories(): Promise<Category[]> {
  try {
    const db = await fetchCategories()
    if (db.length > 0) return db
  } catch {}
  return fallbackCategories
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const db = await fetchCategoryBySlug(slug)
    if (db) return db
  } catch {}
  return fallbackCategories.find((c) => c.slug === slug) ?? null
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  try {
    return await fetchProductsByCategorySlug(slug)
  } catch {}
  return []
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    return await fetchAllProducts()
  } catch {}
  return []
}
