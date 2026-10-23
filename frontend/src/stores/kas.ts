import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, AppError } from '../services/api'
import type { Kas, KasInput, SaldoResponse } from '../types'
import { currentMonth } from '../utils/format'

export const useKasStore = defineStore('kas', () => {
  const items = ref<Kas[]>([])
  const saldo = ref<SaldoResponse | null>(null)
  const filterMonth = ref(currentMonth())
  const includeCancelled = ref(true)
  const loading = ref(false)
  const loadingSaldo = ref(false)
  const error = ref<string | null>(null)

  async function fetchSaldo(): Promise<void> {
    loadingSaldo.value = true
    try {
      saldo.value = await api<SaldoResponse>('/kas/saldo')
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Gagal memuat saldo'
      throw err
    } finally {
      loadingSaldo.value = false
    }
  }

  async function fetchList(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filterMonth.value) params.set('month', filterMonth.value)
      if (includeCancelled.value) params.set('include_cancelled', 'true')
      const qs = params.toString()
      items.value = await api<Kas[]>(`/kas${qs ? `?${qs}` : ''}`)
    } catch (err: unknown) {
      error.value = err instanceof AppError ? err.message : 'Gagal memuat riwayat kas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(input: KasInput): Promise<Kas> {
    const created = await api<Kas>('/kas', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    await Promise.all([fetchList(), fetchSaldo()])
    return created
  }

  async function cancel(id: number, cancel_reason: string): Promise<Kas> {
    const updated = await api<Kas>(`/kas/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ cancel_reason }),
    })
    await Promise.all([fetchList(), fetchSaldo()])
    return updated
  }

  function setFilterMonth(month: string): void {
    filterMonth.value = month
  }

  return {
    items,
    saldo,
    filterMonth,
    includeCancelled,
    loading,
    loadingSaldo,
    error,
    fetchSaldo,
    fetchList,
    create,
    cancel,
    setFilterMonth,
  }
})
