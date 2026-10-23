import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, AppError } from '../services/api'
import type { Inventaris, InventarisInput, Kondisi } from '../types'

export const useInventarisStore = defineStore('inventaris', () => {
  const items = ref<Inventaris[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filterKondisi = ref('')
  const filterStatus = ref('')

  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filterKondisi.value) params.set('kondisi', filterKondisi.value)
      if (filterStatus.value) params.set('status_pinjam', filterStatus.value)
      const qs = params.toString()
      items.value = await api<Inventaris[]>(`/inventaris${qs ? `?${qs}` : ''}`)
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Gagal memuat inventaris'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(input: InventarisInput): Promise<Inventaris> {
    const created = await api<Inventaris>('/inventaris', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    await fetchAll()
    return created
  }

  async function update(id: number, input: InventarisInput): Promise<Inventaris> {
    const updated = await api<Inventaris>(`/inventaris/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    })
    await fetchAll()
    return updated
  }

  async function togglePinjam(id: number): Promise<Inventaris> {
    const updated = await api<Inventaris>(`/inventaris/${id}/toggle-pinjam`, {
      method: 'PATCH',
    })
    await fetchAll()
    return updated
  }

  async function setKondisi(id: number, kondisi: Kondisi): Promise<Inventaris> {
    const updated = await api<Inventaris>(`/inventaris/${id}/kondisi`, {
      method: 'PATCH',
      body: JSON.stringify({ kondisi }),
    })
    await fetchAll()
    return updated
  }

  async function remove(id: number): Promise<void> {
    await api<null>(`/inventaris/${id}`, { method: 'DELETE' })
    await fetchAll()
  }

  return {
    items,
    loading,
    error,
    filterKondisi,
    filterStatus,
    fetchAll,
    create,
    update,
    togglePinjam,
    setKondisi,
    remove,
  }
})
