<script setup lang="ts">
import { formatRupiah, formatDateTimeID } from '../../utils/format'
import type { SaldoResponse } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

defineProps<{
  data: SaldoResponse | null
  loading?: boolean
  error?: string | null
  compact?: boolean
}>()
</script>

<template>
  <div class="overflow-hidden rounded-2xl shadow-card ring-1 ring-slate-900/5">
    <div class="grid gap-0 md:grid-cols-3">
      <!-- Saldo utama: panel gradient + pola -->
      <div class="panel-brand px-6 py-7 text-white md:col-span-1">
        <div class="pattern-islamic absolute inset-0" aria-hidden="true" />
        <div class="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-amber-300/15 blur-2xl" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-teal-300/10 blur-2xl" aria-hidden="true" />

        <div class="relative">
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20" aria-hidden="true">
              <svg class="h-4 w-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <p class="text-[11px] font-bold tracking-[0.15em] text-emerald-100 uppercase">
              {{ compact ? 'Saldo Kas' : 'Transparansi Kas Masjid' }}
            </p>
          </div>

          <LoadingSpinner v-if="loading" label="Memuat saldo..." size="sm" />
          <p v-else-if="error" class="mt-2 text-sm text-red-200">{{ error }}</p>
          <template v-else>
            <p class="mt-2.5 text-3xl font-extrabold tracking-tight tabular-nums md:text-4xl">
              {{ formatRupiah(data?.saldo ?? 0) }}
            </p>
            <p v-if="data?.as_of" class="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-emerald-100 ring-1 ring-white/15">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
              Diperbarui {{ formatDateTimeID(data.as_of) }}
            </p>
          </template>
        </div>
      </div>

      <!-- Statistik masuk & keluar -->
      <div class="grid grid-cols-2 divide-x divide-slate-100 bg-white md:col-span-2">
        <div class="flex flex-col justify-center gap-2.5 px-6 py-7">
          <div class="flex items-center gap-2.5">
            <span class="icon-bubble h-9 w-9 bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-600/30" aria-hidden="true">
              <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </span>
            <span class="text-xs font-bold tracking-wider text-slate-500 uppercase">
              {{ compact ? 'Total Masuk' : 'Total Pemasukan' }}
            </span>
          </div>
          <p v-if="loading" class="h-7 w-32 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          <p v-else-if="error" class="text-sm text-slate-400">—</p>
          <p v-else class="text-xl font-extrabold tabular-nums text-emerald-700 md:text-2xl">
            {{ formatRupiah(data?.total_masuk ?? 0) }}
          </p>
        </div>

        <div class="flex flex-col justify-center gap-2.5 px-6 py-7">
          <div class="flex items-center gap-2.5">
            <span class="icon-bubble h-9 w-9 bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-red-500/30" aria-hidden="true">
              <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </span>
            <span class="text-xs font-bold tracking-wider text-slate-500 uppercase">
              {{ compact ? 'Total Keluar' : 'Total Pengeluaran' }}
            </span>
          </div>
          <p v-if="loading" class="h-7 w-32 animate-pulse rounded-lg bg-slate-100" aria-hidden="true" />
          <p v-else-if="error" class="text-sm text-slate-400">—</p>
          <p v-else class="text-xl font-extrabold tabular-nums text-red-600 md:text-2xl">
            {{ formatRupiah(data?.total_keluar ?? 0) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
