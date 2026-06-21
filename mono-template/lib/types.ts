export interface OptionsGroupEntry {
  val?: string
  name_ar?: string
  name_fr?: string
  price_addon: number
}

export interface OptionsGroup {
  label_ar: string
  label_fr: string
  options: OptionsGroupEntry[]
}

export interface Product {
  id: string
  categoryId: string
  nameAr: string
  nameFr: string
  descriptionAr: string
  descriptionFr: string
  primaryImage: string
  images: string[]
  isFeatured: boolean
  basePrice: number
  currency: string
  categorySlug: string
  optionsConfig: Record<string, OptionsGroup>
}

export interface Category {
  id: string
  slug: string
  nameAr: string
  nameFr: string
  image: string
  gradient: string
  isActive: boolean
  sortOrder: number
}

export interface Wilaya {
  id: number
  nameAr: string
  nameFr: string
  shippingHomeFee: number
  shippingDeskFee: number
}

export interface PromoCode {
  id: string
  code: string
  discountPercentage: number
  isActive: boolean
}

export interface Faq {
  id: string
  questionAr: string
  questionFr: string
  answerAr: string
  answerFr: string
  sortOrder: number
  isActive: boolean
}

export interface SiteSetting {
  key: string
  valueAr: string
  valueFr: string
  description: string
}
