"use client"

import React, { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { Product } from "@/lib/categories"

export interface CartItem {
  cartItemId: string
  product: Product
  quantity: number
  selections: Record<string, string>
  selectionsLabels: Record<string, string>
  unitPrice: number
  image: string
}

interface CartContextType {
  isOpen: boolean
  items: CartItem[]
  cartCount: number
  cartTotal: number
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  addToCart: (
    product: Product,
    quantity?: number,
    selections?: Record<string, string>,
    selectionsLabels?: Record<string, string>,
    unitPrice?: number,
    image?: string,
  ) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])

  const toggleCart = useCallback(() => setIsOpen((v) => !v), [])
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      selections: Record<string, string> = {},
      selectionsLabels: Record<string, string> = {},
      unitPrice?: number,
      image = "",
    ) => {
      const price = unitPrice ?? product.basePrice
      const cartItemId = `${product.id}::${JSON.stringify(selections)}`
      setItems((prev) => {
        const existing = prev.find((item) => item.cartItemId === cartItemId)
        if (existing) {
          return prev.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        }
        return [
          ...prev,
          {
            cartItemId,
            product,
            quantity,
            selections,
            selectionsLabels,
            unitPrice: price,
            image,
          },
        ]
      })
    },
    [],
  )

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item,
      ),
    )
  }, [])

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items],
  )

  return (
    <CartContext.Provider
      value={{
        isOpen,
        items,
        cartCount,
        cartTotal,
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
