"use client"

import { useState, useActionState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { ImageUploader } from "../_components/image-uploader"
import { OptionsBuilder } from "../_components/options-builder"
import type { Category, Product, OptionsGroup } from "@/lib/types"

interface Props {
  categories: Pick<Category, "id" | "nameAr" | "nameFr">[]
  product?: Product | null
}

const ADMIN_BASE = "/afa5e04feb3266f1"

export function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [langTab, setLangTab] = useState<"ar" | "fr">("fr")
  const [nameAr, setNameAr] = useState(product?.nameAr || "")
  const [nameFr, setNameFr] = useState(product?.nameFr || "")
  const [descAr, setDescAr] = useState(product?.descriptionAr || "")
  const [descFr, setDescFr] = useState(product?.descriptionFr || "")
  const [categoryId, setCategoryId] = useState(product?.categoryId || "")
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? 0)
  const [primaryImage, setPrimaryImage] = useState(product?.primaryImage || "")
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false)
  const [optionsConfig, setOptionsConfig] = useState<Record<string, OptionsGroup>>(
    (product?.optionsConfig as Record<string, OptionsGroup>) || {},
  )
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!product) return
    const { deleteProduct } = await import("../_actions/products")
    const res = await deleteProduct(product.id)
    if (res.error) setError(res.error)
    else router.push(`${ADMIN_BASE}/products`)
  }

  const handleSave = async () => {
    setError("")
    const syncedImages = primaryImage
      ? images.includes(primaryImage)
        ? images
        : [primaryImage, ...images]
      : images
    const payload = {
      nameAr,
      nameFr,
      descriptionAr: descAr,
      descriptionFr: descFr,
      categoryId,
      basePrice,
      primaryImage,
      images: syncedImages,
      isFeatured,
      optionsConfig,
    }

    const { createProduct, updateProduct } = await import("../_actions/products")
    const res = isEdit
      ? await updateProduct(product!.id, payload)
      : await createProduct(payload)

    if (res.error) setError(res.error)
    else router.push(`${ADMIN_BASE}/products`)
  }

  const addImage = (url: string) => {
    if (url && !images.includes(url)) setImages((prev) => [...prev, url])
  }

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push(`${ADMIN_BASE}/products`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-medium text-[#0A0A0A]">
          {isEdit ? "Modifier le produit" : "Nouveau produit"}
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
              <Field label="Nom du produit (FR)">
                <input
                  type="text"
                  value={nameFr}
                  onChange={(e) => setNameFr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
                  placeholder="Canapé design moderne"
                />
              </Field>
              <Field label="Description (FR)">
                <textarea
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20 resize-y"
                  placeholder="Description détaillée en français..."
                />
              </Field>
            </div>
          ) : (
            <div className="space-y-4" dir="rtl">
              <Field label="اسم المنتج (AR)">
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
                  placeholder="كنبة عصرية"
                />
              </Field>
              <Field label="الوصف (AR)">
                <textarea
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20 resize-y"
                  placeholder="الوصف باللغة العربية..."
                />
              </Field>
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Informations générales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Catégorie">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              >
                <option value="">Sélectionner...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameFr} / {cat.nameAr}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prix de base (DA)">
              <input
                type="number"
                min={0}
                step={100}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
              />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsFeatured(!isFeatured)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isFeatured ? "bg-[#FF5722]" : "bg-neutral-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isFeatured ? "translate-x-5.5" : "translate-x-0.5"
                }`}
              />
            </div>
            <span className="text-sm text-neutral-700">Produit vedette</span>
          </label>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Image principale</h2>
          <ImageUploader
            currentImage={primaryImage}
            onUpload={(url) => setPrimaryImage(url)}
          />
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Galerie d&apos;images</h2>
          <ImageUploader
            folder="products/gallery"
            onUpload={(url) => addImage(url)}
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {images.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-[#E5E5E5] group">
                  <Image
                    src={url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <span className="text-white text-xs font-medium">X</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-[#0A0A0A]">Variantes (options_config)</h2>
          <OptionsBuilder
            value={optionsConfig}
            onChange={(v) => setOptionsConfig(v)}
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
              onClick={handleDelete}
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
