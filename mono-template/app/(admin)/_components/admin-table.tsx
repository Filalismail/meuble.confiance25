"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown, Plus } from "lucide-react"

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  hideOnMobile?: boolean
  render?: (item: T) => React.ReactNode
}

interface AdminTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  actions?: React.ReactNode
  emptyMessage?: string
  mobileCardRender: (item: T) => React.ReactNode
}

export function AdminTable<T>({
  columns,
  data,
  searchPlaceholder = "Rechercher...",
  searchKeys,
  actions,
  emptyMessage = "Aucun résultat",
  mobileCardRender,
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const filtered = useMemo(() => {
    let items = data
    if (search && searchKeys) {
      const q = search.toLowerCase()
      items = items.filter((item) =>
        searchKeys.some((key) => {
          const v = (item as Record<string, unknown>)[key as string]
          return v != null && String(v).toLowerCase().includes(q)
        }),
      )
    }
    if (sortKey) {
      items = [...items].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey]
        const bVal = (b as Record<string, unknown>)[sortKey]
        if (aVal == null) return 1
        if (bVal == null) return -1
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortDir === "asc" ? cmp : -cmp
      })
    }
    return items
  }, [data, search, searchKeys, sortKey, sortDir])

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E5E5E5]/70 bg-white/60 text-sm focus:outline-none focus:border-[#FF5722]/40 focus:ring-1 focus:ring-[#FF5722]/20"
          />
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>

      <div className="hidden md:block">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5]/60">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`text-left px-5 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider ${
                      col.hideOnMobile ? "hidden" : ""
                    } ${col.sortable ? "cursor-pointer select-none hover:text-neutral-700" : ""}`}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-5 py-16 text-center text-sm text-neutral-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={String((item as Record<string, unknown>).id ?? idx)}
                    className="border-b border-[#E5E5E5]/20 hover:bg-white/40 transition-colors last:border-0"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-5 py-4 ${col.hideOnMobile ? "hidden" : ""}`}
                      >
                        {col.render
                          ? col.render(item)
                          : ((item as Record<string, unknown>)[col.key] as React.ReactNode) ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-neutral-400 bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40">
            {emptyMessage}
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={(item as Record<string, unknown>).id as string || idx}
              className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#E5E5E5]/40 shadow-sm overflow-hidden"
            >
              {mobileCardRender(item)}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
