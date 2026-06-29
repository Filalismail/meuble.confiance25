"use client"

import { useState, useCallback, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Tag,
  HelpCircle,
  MapPin,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const ADMIN_BASE = "/afa5e04feb3266f1"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: `${ADMIN_BASE}/dashboard` },
  { icon: Package, label: "Produits", href: `${ADMIN_BASE}/products` },
  { icon: FolderTree, label: "Catégories", href: `${ADMIN_BASE}/categories` },
  { icon: ShoppingCart, label: "Commandes", href: `${ADMIN_BASE}/orders` },
  { icon: Tag, label: "Codes Promo", href: `${ADMIN_BASE}/promos` },
  { icon: HelpCircle, label: "FAQ", href: `${ADMIN_BASE}/faqs` },
  { icon: MapPin, label: "Wilayas", href: `${ADMIN_BASE}/wilayas` },
  { icon: Settings, label: "Paramètres", href: `${ADMIN_BASE}/settings` },
  { icon: BarChart3, label: "Analytiques", href: `${ADMIN_BASE}/analytics` },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const closeMobile = useCallback(() => setIsMobileOpen(false), [])

  const [prevDir] = useState(() => {
    if (typeof window !== "undefined") return document.documentElement.dir
    return "ltr"
  })

  useEffect(() => {
    document.documentElement.dir = "ltr"
    document.documentElement.lang = "fr"
    return () => {
      document.documentElement.dir = prevDir
    }
  }, [prevDir])

  const isLogin = pathname === ADMIN_BASE

  if (isLogin) return <>{children}</>

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir="ltr">
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white/70 backdrop-blur-2xl border-r border-[#E5E5E5]/60 flex flex-col transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:fixed`}
      >
        <div className="flex items-center gap-3 px-6 pt-8 pb-6">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#E5E5E5]">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={36}
              height={36}
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[#0A0A0A]">Thika 25</p>
            <p className="text-[10px] text-neutral-400 -mt-0.5">Administration</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-[#FF5722]/10 text-[#FF5722] font-medium"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 pb-6 pt-4 border-t border-[#E5E5E5]/40">
          <form action={`${ADMIN_BASE}/api/logout`} method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
            >
              <LogOut size={17} />
              Déconnexion
            </button>
          </form>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={closeMobile}
        />
      )}

      <header className="sticky top-0 z-20 md:hidden bg-white/70 backdrop-blur-2xl border-b border-[#E5E5E5]/60 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E5E5]">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-[#0A0A0A]">Thika 25</span>
        </div>
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main className="flex-1 min-h-screen md:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
