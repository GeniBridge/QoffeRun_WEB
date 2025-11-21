import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../api/endpoints'

interface User { id: number; name: string; email: string; role: string }

interface AuthContextShape {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextShape>({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = globalThis.localStorage?.getItem?.('qofferun_token')
    if (t) {
      setToken(t)
      authAPI.me().then((r) => setUser(r.data.data)).catch(() => {})
    }
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const resp = await authAPI.login({ email, password })
      const t = resp?.data?.token || resp?.data?.data?.token
      if (t) {
        setToken(t)
        globalThis.localStorage?.setItem?.('qofferun_token', t)
        const me = await authAPI.me()
        setUser(me.data.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      await authAPI.register({ name, email, password })
      await login(email, password)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    globalThis.localStorage?.removeItem?.('qofferun_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
