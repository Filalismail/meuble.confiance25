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
  sortOrder: number
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
  isActive: boolean
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export interface OrderLineItem {
  product_id: string
  name_ar: string
  name_fr: string
  quantity: number
  unit_price: number
  selected_options: Record<string, Record<string, string>>
  line_total: number
}

export interface Order {
  id: string
  customerFirstName: string
  customerLastName: string
  phoneNumber: string
  email: string
  wilayaId: number
  deliveryType: "home" | "desk"
  orderNote: string
  itemsJson: OrderLineItem[]
  subtotal: number
  discountApplied: number
  deliveryFee: number
  finalTotal: number
  status: OrderStatus
  createdAt: string
}

export interface DailyAnalyticsSummary {
  id: string
  summaryDate: string
  metricType: string
  metricKey: string
  metricData: Record<string, unknown>
  updatedAt: string
}

export interface PromoCode {
  id: string
  code: string
  discountPercentage: number
  isActive: boolean
  maxUses: number
  currentUses: number
  createdAt: string
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
