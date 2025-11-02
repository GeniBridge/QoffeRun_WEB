import React, { createContext, useContext, useMemo, useState } from 'react'
import Cart from '../lib/Cart'

const CartCtx = createContext(null)
export function CartProvider({ children }){
  const [version, setVersion] = useState(0)
  const cart = useMemo(()=> new Cart({ onChange: ()=> setVersion(v=>v+1) }), [])
  return <CartCtx.Provider value={{ cart, version }}>{children}</CartCtx.Provider>
}
export const useCart = () => useContext(CartCtx)
