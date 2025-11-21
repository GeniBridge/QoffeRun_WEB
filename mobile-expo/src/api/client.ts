import axios from 'axios'

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://api.qofferun.com/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = globalThis.localStorage?.getItem?.('qofferun_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
