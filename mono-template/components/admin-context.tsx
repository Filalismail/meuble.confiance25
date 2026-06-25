"use client"

import { createContext, useContext } from "react"

const AdminContext = createContext<string>("")

export function AdminPrefixProvider({
  prefix,
  children,
}: {
  prefix: string
  children: React.ReactNode
}) {
  return <AdminContext.Provider value={prefix}>{children}</AdminContext.Provider>
}

export function useAdminPrefix(): string {
  return useContext(AdminContext)
}
