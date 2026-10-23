import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, getToken, setToken, AppError } from '../services/api'
import type { LoginResponse, MeResponse, User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken())
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      token.value = data.token
      user.value = data.user
      setToken(data.token)
      return true
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Login gagal'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    setToken(null)
  }

  async function fetchMe(): Promise<void> {
    if (!token.value) return
    try {
      const data = await api<MeResponse>('/auth/me')
      // Backend returns { user: { sub, username, role } } from JWT payload
      const raw = data.user as User & { sub?: number }
      user.value = {
        id: raw.id ?? raw.sub ?? 0,
        username: raw.username,
        role: raw.role,
      }
    } catch {
      logout()
    }
  }

  function hydrateFromStorage(): void {
    token.value = getToken()
  }

  // Sync store when API client clears token on 401
  if (typeof window !== 'undefined') {
    window.addEventListener('simas:unauthorized', () => {
      token.value = null
      user.value = null
    })
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchMe,
    hydrateFromStorage,
  }
})
