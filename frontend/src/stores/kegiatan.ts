import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, AppError } from '../services/api'
import type { Kegiatan, KegiatanInput } from '../types'

export const useKegiatanStore = defineStore('kegiatan', () => {
  const items = ref<Kegiatan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await api<Kegiatan[]>('/kegiatan')
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Gagal memuat kegiatan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUpcoming(limit = 10): Promise<void> {
    loading.value = true
    error.value = null
    try {
      items.value = await api<Kegiatan[]>(`/kegiatan?upcoming=true&limit=${limit}`)
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Gagal memuat kegiatan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(input: KegiatanInput): Promise<Kegiatan> {
    const created = await api<Kegiatan>('/kegiatan', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    await fetchAll()
    return created
  }

  async function update(id: number, input: KegiatanInput): Promise<Kegiatan> {
    const updated = await api<Kegiatan>(`/kegiatan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
    await fetchAll()
    return updated
  }

  async function remove(id: number): Promise<void> {
    await api<null>(`/kegiatan/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  return {
    items,
    loading,
    error,
    fetchAll,
    fetchUpcoming,
    create,
    update,
    remove,
  }
})
