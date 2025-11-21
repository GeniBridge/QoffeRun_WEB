import React, { createContext, useContext, useState } from 'react'

interface CartItem {
  menu_item_id: number
  name: string
  price: number
  qty: number
  extras?: number[]
}

interface CartContextType {
  items: CartItem[]
  branchId: number | null
  setBranchId: (id: number) => void
  addItem: (item: CartItem) => void
  removeItem: (menu_item_id: number) => void
  clearCart: () => void
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [branchId, setBranchId] = useState<number | null>(null)

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.menu_item_id === newItem.menu_item_id)
      if (existing) {
        return prev.map((it) => it.menu_item_id === newItem.menu_item_id ? { ...it, qty: it.qty + newItem.qty } : it)
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (menu_item_id: number) => {
    setItems((prev) => prev.filter((it) => it.menu_item_id !== menu_item_id))
  }

  const clearCart = () => {
    setItems([])
    setBranchId(null)
  }

  const totalPrice = items.reduce((sum, it) => sum + it.price * it.qty, 0)

  return <CartContext.Provider value={{ items, branchId, setBranchId, addItem, removeItem, clearCart, totalPrice }}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

