"use client"

import { Check } from "lucide-react"

interface Props {
  value: string
  onChange: (gradient: string) => void
}

const presets = [
  { gradient: "from-[#F5F0EB] to-[#E8DFD3]", label: "Crème chaude" },
  { gradient: "from-[#FFF3E0] to-[#FFE0B2]", label: "Pêche" },
  { gradient: "from-[#FCE4EC] to-[#F8BBD0]", label: "Rose" },
  { gradient: "from-[#E3F2FD] to-[#BBDEFB]", label: "Bleu glacé" },
  { gradient: "from-[#F3E5F5] to-[#E1BEE7]", label: "Lavande" },
  { gradient: "from-[#E8F5E9] to-[#C8E6C9]", label: "Sauge" },
  { gradient: "from-[#FFF8E1] to-[#FFECB3]", label: "Miel" },
  { gradient: "from-[#FBE9E7] to-[#FFCCBC]", label: "Terre cuite" },
]

function gradientToCss(g: string): string {
  return `linear-gradient(135deg, ${g.replace(/from-\[([^\]]+)\]\s*to-\[([^\]]+)\]/, "$1, $2")})`
}

export function GradientPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {presets.map((p) => {
        const selected = value === p.gradient
        return (
          <button
            key={p.gradient}
            onClick={() => onChange(p.gradient)}
            className="relative group"
            title={p.label}
          >
            <div
              className={`w-14 h-14 rounded-xl border-2 transition-all ${
                selected
                  ? "border-[#FF5722] ring-2 ring-[#FF5722]/20"
                  : "border-[#E5E5E5]/60 hover:border-[#FF5722]/40"
              }`}
              style={{ background: gradientToCss(p.gradient) }}
            />
            {selected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF5722] flex items-center justify-center">
                <Check size={11} className="text-white" />
              </div>
            )}
            <p className="text-[10px] text-neutral-400 text-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {p.label}
            </p>
          </button>
        )
      })}
    </div>
  )
}
