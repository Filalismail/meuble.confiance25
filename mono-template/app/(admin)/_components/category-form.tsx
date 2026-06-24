"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { ImageUploader } from "../_components/image-uploader"
import { GradientPicker } from "../_components/gradient-picker"
import type { Category } from "@/lib/types"

interface Props {
  category?: Category | null
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function CategoryForm({ category }: Props) {
  const router = useRouter()
  const isEdit = !!category

  const [langTab, setLangTab] = useState<"ar" | "fr">("fr")
  const [nameAr, setNameAr] = useState(category?.nameAr || "")
  const [nameFr, setNameFr] = useState(category?.nameFr || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [image, setImage] = useState(category?.image || "")
  const [gradient, setGradient] = useState(category?.gradient || "from-[#F5F0EB] to-[#E8DFD3]")
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0)
  const [isActive, setIsActive] = useState(category?.isActive ?? true)
  const [error, setError] = useState("")

  const autoSlug = useCallback(
    (val: string) => {
      if (isEdit) return
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      )
    },
    [isEdit],
  )

  const handleSave = async () => {
    setError("")
    const payload = { nameAr, nameFr, slug, image, gradient, isActive, sortOrder }

    const { createCategory, updateCategory } = await import("../_actions/categories")
    const res = isEdit
      ? await updateCategory(category!.id, payload)
      : await createCategory(payload)

    if (res.error) setError(res.error)
    else router.push(`${ADMIN_BASE}/categories`)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push(`${ADMIN_BASE}/categories`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0A0A0A]">
          {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h1>
      </div>

      <div className="max-w-3xl space-y-8">
        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm">
          <div className="flex items-center gap-1 mb-6 border-b border-[#E5E5E5]/40 pb-3">
            <button
              onClick={() => setLangTab("fr")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                langTab === "fr"
                  ? "bg-[#FF5722]/10 text-[#FF5722]"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setLangTab("ar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                langTab === "ar"
                  ? "bg-[#FF5722]/10 text-[#FF5722]"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              العربية
            </button>
          </div>

          {langTab === "fr" ? (
            <div className="space-y-4">
              <Field label="Nom de la catégorie (FR)">
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => {
                    setNameFr(e.target.value)
                    autoSlug(e.target.value)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
                  placeholder="Canapés"
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-4" dir="rtl">
              <Field label="اسم الفئة (AR)">
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
                  placeholder="كنب"
                />
              </Field>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Configuration</h2>
          <Field label="Slug (identifiant URL)">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm font-mono focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              placeholder="canepe-design"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Utilisé dans l&apos;URL : /categories/<span className="text-[#FF5722]">{slug || "slug"}</span>
            </p>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ordre d&apos;affichage">
              <input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              />
            </Field>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setIsActive(!isActive)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    isActive ? "bg-[#FF5722]" : "bg-neutral-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      isActive ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-sm text-neutral-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Image de la catégorie</h2>
          <ImageUploader
            currentImage={image}
            onUpload={(url) => setImage(url)}
            folder="categories"
          />
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Dégradé d&apos;arrière-plan</h2>
          <GradientPicker
            value={gradient}
            onChange={(g) => setGradient(g)}
          />
          <div
            className={`w-full h-20 rounded-xl bg-gradient-to-br ${gradient} border border-[#E5E5E5]/40`}
          />
        </div>

        <div className="flex items-center gap-3 pb-12">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#FF5722] text-white text-sm font-medium hover:bg-[#FF5722]/90 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Enregistrer
          </button>
          {isEdit && (
            <button
              onClick={async () => {
                const { deleteCategory } = await import("../_actions/categories")
                await deleteCategory(category!.id)
                router.push(`${ADMIN_BASE}/categories`)
              }}
              className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
