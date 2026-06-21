import type { Product, OptionsGroup, OptionsGroupEntry } from "@/lib/types"

export function getGroupLabel(group: OptionsGroup, locale: string): string {
  return locale === "ar" ? group.label_ar : group.label_fr
}

export function getOptionLabel(
  group: OptionsGroup,
  entry: OptionsGroupEntry,
  locale: string,
): string {
  if (locale === "ar" && entry.name_ar) return entry.name_ar
  if (locale === "fr" && entry.name_fr) return entry.name_fr
  if (entry.val) return entry.val
  return entry.name_fr ?? entry.name_ar ?? entry.val ?? ""
}

export function getOptionValue(group: OptionsGroup, entry: OptionsGroupEntry): string {
  return entry.val ?? entry.name_fr ?? entry.name_ar ?? ""
}

export function computeUnitPrice(
  product: Product,
  selections: Record<string, string>,
): number {
  let addon = 0
  for (const [groupKey, selectedValue] of Object.entries(selections)) {
    const group = product.optionsConfig[groupKey]
    if (!group) continue
    const entry = group.options.find(
      (opt) => getOptionValue(group, opt) === selectedValue,
    )
    if (entry) addon += entry.price_addon
  }
  return product.basePrice + addon
}

export function getProductMinPrice(product: Product): number {
  let minAddon = 0
  for (const group of Object.values(product.optionsConfig)) {
    const groupMin = Math.min(...group.options.map((o) => o.price_addon))
    minAddon += groupMin
  }
  return product.basePrice + minAddon
}

export function getProductMaxPrice(product: Product): number {
  let maxAddon = 0
  for (const group of Object.values(product.optionsConfig)) {
    const groupMax = Math.max(...group.options.map((o) => o.price_addon))
    maxAddon += groupMax
  }
  return product.basePrice + maxAddon
}

export function getPriceRange(products: Product[]): { globalMin: number; globalMax: number } {
  if (products.length === 0) return { globalMin: 0, globalMax: 0 }
  let globalMin = Infinity
  let globalMax = -Infinity
  for (const p of products) {
    const minP = getProductMinPrice(p)
    const maxP = getProductMaxPrice(p)
    if (minP < globalMin) globalMin = minP
    if (maxP > globalMax) globalMax = maxP
  }
  return { globalMin, globalMax }
}

export function getDefaultSelections(product: Product): Record<string, string> {
  const selections: Record<string, string> = {}
  for (const [key, group] of Object.entries(product.optionsConfig)) {
    if (group.options.length > 0) {
      selections[key] = getOptionValue(group, group.options[0])
    }
  }
  return selections
}

export function getSelectionsLabels(
  product: Product,
  selections: Record<string, string>,
  locale: string,
): Record<string, string> {
  const labels: Record<string, string> = {}
  for (const [groupKey, selectedValue] of Object.entries(selections)) {
    const group = product.optionsConfig[groupKey]
    if (!group) continue
    const entry = group.options.find(
      (opt) => getOptionValue(group, opt) === selectedValue,
    )
    if (entry) {
      labels[groupKey] = getOptionLabel(group, entry, locale)
    }
  }
  return labels
}
