"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus, Save, Trash2, X } from "lucide-react"
import { updateSetting, createSetting, deleteSetting } from "../../_actions/settings"
import { ConfirmDialog } from "../../_components/confirm-dialog"

export interface SettingRow {
  key: string
  value_ar: string
  value_fr: string
  description: string
}

interface Props {
  settings: SettingRow[]
}

const SINGLE_VALUE_KEYS = ["contact_phone", "contact_whatsapp", "delivery_threshold"]

export function SettingsClient({ settings }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [deleteKey, setDeleteKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const toDelete = settings.find((s) => s.key === deleteKey)

  const handleSave = useCallback(
    async (key: string, valueFr: string, valueAr: string) => {
      setError(null)
      const formData = new FormData()
      formData.set("valueFr", valueFr)
      formData.set("valueAr", valueAr)
      const result = await updateSetting(key, formData)
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Erreur")
        return
      }
      setEditingKey(null)
      startTransition(() => router.refresh())
    },
    [router],
  )

  const handleCreate = useCallback(
    async (key: string, valueFr: string, valueAr: string, description: string) => {
      setError(null)
      const formData = new FormData()
      formData.set("key", key)
      formData.set("valueFr", valueFr)
      formData.set("valueAr", valueAr)
      formData.set("description", description)
      const result = await createSetting(formData)
      if (result.error) {
        setError(typeof result.error === "string" ? result.error : "Erreur")
        return
      }
      setShowNew(false)
      startTransition(() => router.refresh())
    },
    [router],
  )

  const handleDelete = useCallback(async () => {
    if (!deleteKey) return
    setError(null)
    const result = await deleteSetting(deleteKey)
    if (result.error) {
      setError(typeof result.error === "string" ? result.error : "Erreur")
      return
    }
    setDeleteKey(null)
    startTransition(() => router.refresh())
  }, [deleteKey, router])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-[#0A0A0A]">Paramètres</h1>
        <button
          onClick={() => {
            setShowNew(true)
            setEditingKey(null)
          }}
          className="flex items-center gap-2 px-4 h-9 rounded-xl bg-[#FF5722] text-white text-xs font-medium hover:bg-[#FF5722]/90 transition-colors"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-red-50 text-xs text-red-500 border border-red-100">
          {error}
        </div>
      )}

      <div className={`space-y-3 relative ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        {showNew && (
          <NewRow
            onSave={handleCreate}
            onCancel={() => setShowNew(false)}
          />
        )}

        {settings.length === 0 && !showNew && (
          <div className="text-sm text-neutral-400 text-center py-16">
            Aucun paramètre — ajoutez-en un
          </div>
        )}

        {settings.map((s) => (
          <SettingRowItem
            key={s.key}
            setting={s}
            isEditing={editingKey === s.key}
            onStartEdit={() => {
              setEditingKey(s.key)
              setShowNew(false)
            }}
            onSave={handleSave}
            onCancelEdit={() => setEditingKey(null)}
            onDelete={() => setDeleteKey(s.key)}
          />
        ))}
      </div>

      <ConfirmDialog
        open={!!deleteKey}
        onConfirm={handleDelete}
        onCancel={() => setDeleteKey(null)}
        title="Supprimer le paramètre"
        message={`Supprimer "${toDelete?.key}" ? Cette action est irréversible.`}
        variant="danger"
      />
    </div>
  )
}

function SettingRowItem({
  setting,
  isEditing,
  onStartEdit,
  onSave,
  onCancelEdit,
  onDelete,
}: {
  setting: SettingRow
  isEditing: boolean
  onStartEdit: () => void
  onSave: (key: string, valueFr: string, valueAr: string) => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  const isSingle = SINGLE_VALUE_KEYS.includes(setting.key)
  const [fr, setFr] = useState(setting.value_fr)
  const [ar, setAr] = useState(setting.value_ar)
  const [val, setVal] = useState(setting.value_fr)

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-mono text-neutral-500 uppercase">
            {setting.key}
          </span>
          {setting.description && (
            <span className="text-[11px] text-neutral-400 hidden sm:inline">
              {setting.description}
            </span>
          )}
        </div>
      </div>
      {isSingle ? (
        <div className="mt-3">
          {isEditing ? (
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            />
          ) : (
            <p className="text-sm text-[#0A0A0A] min-h-[2rem]">{setting.value_fr || "—"}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">Français</label>
            {isEditing ? (
              <input
                value={fr}
                onChange={(e) => setFr(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
              />
            ) : (
              <p className="text-sm text-[#0A0A0A] min-h-[2rem] break-words">{setting.value_fr || "—"}</p>
            )}
          </div>
          <div dir="rtl">
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">العربية</label>
            {isEditing ? (
              <input
                value={ar}
                onChange={(e) => setAr(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
              />
            ) : (
              <p className="text-sm text-[#0A0A0A] min-h-[2rem] break-words">{setting.value_ar || "—"}</p>
            )}
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-[#E5E5E5]/40">
        {isEditing ? (
          <>
            <button
              onClick={() => isSingle ? onSave(setting.key, val, val) : onSave(setting.key, fr, ar)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Save size={13} />
              Enregistrer
            </button>
            <button
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <X size={13} />
              Annuler
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onStartEdit}
              className="px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function NewRow({
  onSave,
  onCancel,
}: {
  onSave: (key: string, valueFr: string, valueAr: string, description: string) => void
  onCancel: () => void
}) {
  const [key, setKey] = useState("")
  const [fr, setFr] = useState("")
  const [ar, setAr] = useState("")
  const [val, setVal] = useState("")
  const [desc, setDesc] = useState("")

  const isSingle = SINGLE_VALUE_KEYS.includes(key)

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#FF5722]/30 p-5 shadow-sm ring-1 ring-[#FF5722]/10">
      <div className="mb-3">
        <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">Clé</label>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          placeholder="ex: social_instagram"
        />
      </div>
      <div>
        <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">Description</label>
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          placeholder="Description du paramètre"
        />
      </div>
      {isSingle ? (
        <div className="mt-3">
          <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">Valeur</label>
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">Français</label>
            <input
              value={fr}
              onChange={(e) => setFr(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            />
          </div>
          <div dir="rtl">
            <label className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 block">العربية</label>
            <input
              value={ar}
              onChange={(e) => setAr(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm outline-none focus:border-[#FF5722]/40 transition-colors"
            />
          </div>
        </div>
      )}
      <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-[#E5E5E5]/40">
        <button
          onClick={() => isSingle ? onSave(key, val, val, desc) : onSave(key, fr, ar, desc)}
          disabled={!key.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
        >
          <Save size={13} />
          Créer
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-500 hover:bg-neutral-100 transition-colors"
        >
          <X size={13} />
          Annuler
        </button>
      </div>
    </div>
  )
}
