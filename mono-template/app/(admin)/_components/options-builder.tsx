"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react"
import type { OptionsGroup, OptionsGroupEntry } from "@/lib/types"

interface Props {
  value: Record<string, OptionsGroup>
  onChange: (value: Record<string, OptionsGroup>) => void
}

const COLOR_KEYWORDS = [
  "color", "couleur", "colour", "finish", "finition",
  "لون", "اللون", "دهان", "تلوين",
]

const DIMENSION_CHIPS = ["160x200", "180x200", "200x200", "90x190", "120x200", "140x190", "100x200", "220x240"]

let groupCounter = 0
function generateGroupKey(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
  return slug ? `${slug}_${++groupCounter}` : `group_${Date.now()}_${++groupCounter}`
}

function isColorGroup(key: string): boolean {
  return COLOR_KEYWORDS.some((kw) => key.includes(kw))
}

export function OptionsBuilder({ value, onChange }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [newGroupLabelAr, setNewGroupLabelAr] = useState("")
  const [newGroupLabelFr, setNewGroupLabelFr] = useState("")

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const addGroup = () => {
    if (!newGroupLabelAr.trim() && !newGroupLabelFr.trim()) return
    const labelAr = newGroupLabelAr.trim() || newGroupLabelFr.trim()
    const labelFr = newGroupLabelFr.trim() || newGroupLabelAr.trim()
    const key = generateGroupKey(labelFr)
    const updated = { ...value }
    updated[key] = { label_ar: labelAr, label_fr: labelFr, options: [] }
    onChange(updated)
    setNewGroupLabelAr("")
    setNewGroupLabelFr("")
    setExpandedGroups((prev) => ({ ...prev, [key]: true }))
  }

  const removeGroup = (key: string) => {
    const updated = { ...value }
    delete updated[key]
    onChange(updated)
  }

  const updateGroupLabel = (key: string, lang: "ar" | "fr", val: string) => {
    const updated = { ...value }
    if (!updated[key]) return
    if (lang === "ar") updated[key] = { ...updated[key], label_ar: val }
    else updated[key] = { ...updated[key], label_fr: val }
    onChange(updated)
  }

  const addOption = (groupKey: string) => {
    const updated = { ...value }
    const group = { ...updated[groupKey] }
    group.options = [...group.options, { name_ar: "", name_fr: "", price_addon: 0 }]
    updated[groupKey] = group
    onChange(updated)
  }

  const removeOption = (groupKey: string, optIdx: number) => {
    const updated = { ...value }
    const group = { ...updated[groupKey] }
    group.options = group.options.filter((_, i) => i !== optIdx)
    updated[groupKey] = group
    onChange(updated)
  }

  const moveOption = (groupKey: string, optIdx: number, dir: "up" | "down") => {
    const targetIdx = dir === "up" ? optIdx - 1 : optIdx + 1
    const opts = value[groupKey]?.options
    if (!opts || targetIdx < 0 || targetIdx >= opts.length) return
    const updated = { ...value }
    const group = { ...updated[groupKey] }
    const options = [...group.options]
    const tmp = options[optIdx]
    options[optIdx] = options[targetIdx]
    options[targetIdx] = tmp
    group.options = options
    updated[groupKey] = group
    onChange(updated)
  }

  const updateOption = (
    groupKey: string,
    optIdx: number,
    field: keyof OptionsGroupEntry,
    fieldVal: string | number,
  ) => {
    const updated = { ...value }
    const group = { ...updated[groupKey] }
    group.options = group.options.map((opt, i) =>
      i === optIdx ? { ...opt, [field]: fieldVal } : opt,
    )
    updated[groupKey] = group
    onChange(updated)
  }

  const applyDimensionChip = (groupKey: string, chip: string) => {
    const updated = { ...value }
    const group = { ...updated[groupKey] }
    group.options = [
      ...group.options,
      { val: chip, price_addon: 0 },
    ]
    updated[groupKey] = group
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, group]) => {
        const isColor = isColorGroup(key)
        const expanded = expandedGroups[key] !== false

        return (
          <div
            key={key}
            className="bg-white/60 backdrop-blur-sm rounded-xl border border-[#E5E5E5]/60 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <GripVertical size={15} className="text-neutral-300 flex-shrink-0" />
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={group.label_ar}
                  onChange={(e) => updateGroupLabel(key, "ar", e.target.value)}
                  placeholder="Nom du groupe (AR)"
                  className="px-3 py-1.5 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
                  dir="rtl"
                />
                <input
                  type="text"
                  value={group.label_fr}
                  onChange={(e) => updateGroupLabel(key, "fr", e.target.value)}
                  placeholder="Nom du groupe (FR)"
                  className="px-3 py-1.5 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
                />
              </div>
              <button
                onClick={() => removeGroup(key)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => toggleGroup(key)}
                className="text-xs text-neutral-400 hover:text-neutral-600 flex-shrink-0"
              >
                {expanded ? "▲" : "▼"}
              </button>
            </div>

            {expanded && (
              <>
                <div className="space-y-2">
                  {group.options.map((opt, oi) => {
                    const hasVal = !!opt.val
                    return (
                      <div
                        key={oi}
                        className="flex flex-wrap items-end gap-2 p-2.5 rounded-lg bg-white/40 border border-[#E5E5E5]/40"
                      >
                        {isColor && !hasVal && (
                          <div className="flex-shrink-0">
                            <input
                              type="color"
                              value={opt.name_fr || "#ffffff"}
                              onChange={(e) => updateOption(key, oi, "name_fr", e.target.value)}
                              className="w-9 h-9 rounded-lg cursor-pointer border border-[#E5E5E5]/60 p-0.5"
                            />
                          </div>
                        )}
                        {hasVal ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF5722]/5 border border-[#FF5722]/20 text-sm text-neutral-700">
                            <span>{opt.val}</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              value={opt.name_ar || ""}
                              onChange={(e) => updateOption(key, oi, "name_ar", e.target.value)}
                              placeholder="Option (AR)"
                              className="flex-1 min-w-[100px] px-2.5 py-1.5 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
                              dir="rtl"
                            />
                            <input
                              type="text"
                              value={opt.name_fr || ""}
                              onChange={(e) => updateOption(key, oi, "name_fr", e.target.value)}
                              placeholder={isColor ? "Couleur" : "Option (FR)"}
                              className="flex-1 min-w-[100px] px-2.5 py-1.5 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
                            />
                          </>
                        )}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-xs text-neutral-400">+</span>
                          <input
                            type="number"
                            min={0}
                            step={100}
                            value={opt.price_addon}
                            onChange={(e) =>
                              updateOption(key, oi, "price_addon", Number(e.target.value))
                            }
                            className="w-20 px-2.5 py-1.5 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm text-right focus:outline-none focus:border-[#FF5722]/40"
                          />
                          <span className="text-xs text-neutral-400">DA</span>
                        </div>
                        <button
                          onClick={() => moveOption(key, oi, "up")}
                          disabled={oi === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-[#FF5722] disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveOption(key, oi, "down")}
                          disabled={oi >= group.options.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-300 hover:text-[#FF5722] disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => removeOption(key, oi)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="flex flex-wrap gap-2">
                  {DIMENSION_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => applyDimensionChip(key, chip)}
                      className="px-2.5 py-1 rounded-lg text-xs border border-[#E5E5E5]/60 text-neutral-500 hover:border-[#FF5722]/40 hover:text-[#FF5722] hover:bg-[#FF5722]/5 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => addOption(key)}
                  className="flex items-center gap-1.5 text-xs text-[#FF5722] hover:text-[#FF5722]/80 transition-colors"
                >
                  <Plus size={13} />
                  Ajouter une option
                </button>
              </>
            )}
          </div>
        )
      })}

      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-dashed border-[#E5E5E5]/60 p-4">
        <p className="text-xs text-neutral-400 mb-2">Nouveau groupe d&apos;options</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={newGroupLabelAr}
            onChange={(e) => setNewGroupLabelAr(e.target.value)}
            placeholder="Étiquette (AR)"
            className="px-3 py-2 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
            dir="rtl"
          />
          <input
            type="text"
            value={newGroupLabelFr}
            onChange={(e) => setNewGroupLabelFr(e.target.value)}
            placeholder="Étiquette (FR)"
            className="px-3 py-2 rounded-lg border border-[#E5E5E5]/70 bg-white/50 text-sm focus:outline-none focus:border-[#FF5722]/40"
          />
          <button
            onClick={addGroup}
            disabled={!newGroupLabelAr.trim() && !newGroupLabelFr.trim()}
            className="px-4 py-2 rounded-lg bg-[#FF5722]/10 text-[#FF5722] text-sm font-medium hover:bg-[#FF5722]/20 disabled:opacity-40 transition-colors"
          >
            <Plus size={15} className="inline mr-1" />
            Ajouter
          </button>
        </div>
      </div>
    </div>
  )
}
