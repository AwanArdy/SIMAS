<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { api, AppError } from '../../services/api'
import type { SaldoResponse } from '../../types'
import SaldoCard from '../../components/kas/SaldoCard.vue'

const auth = useAuthStore()
const masjidName = import.meta.env.VITE_MASJID_NAME || 'Masjid Al-Ikhlas'

const saldo = ref<SaldoResponse | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const cards = [
  {
    to: '/dashboard/kegiatan',
    title: 'Kegiatan',
    desc: 'Kelola agenda kajian, khutbah, dan acara masjid',
    iconPath:
      'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-600/40',
    glow: 'hover:shadow-emerald-600/15 hover:ring-emerald-500/20',
  },
  {
    to: '/dashboard/kas',
    title: 'Kas',
    desc: 'Catat infaq, pengeluaran, dan batalkan transaksi salah',
    iconPath:
      'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/40',
    glow: 'hover:shadow-amber-500/15 hover:ring-amber-500/20',
  },
  {
    to: '/dashboard/inventaris',
    title: 'Inventaris',
    desc: 'Lacak aset, kondisi, dan status peminjaman',
    iconPath:
      'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    iconBg: 'bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-indigo-500/40',
    glow: 'hover:shadow-indigo-500/15 hover:ring-indigo-500/20',
  },
]

onMounted(async () => {
  loading.value = true
  try {
    saldo.value = await api<SaldoResponse>('/kas/saldo')
  } catch (err: unknown) {
    error.value = err instanceof AppError ? err.message : 'Gagal memuat ringkasan'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Sambutan -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard Pengurus</h1>
        <p class="mt-1 text-sm text-slate-500">
          Assalamu'alaikum,
          <span class="font-semibold text-slate-700">{{ auth.user?.username || 'Pengurus' }}</span>
          · {{ masjidName }}
        </p>
      </div>
      <div
        class="hidden items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/15 ring-inset sm:flex"
      >
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
        </span>
        Mode Pengurus
      </div>
    </div>

    <!-- Ringkasan saldo -->
    <SaldoCard :data="saldo" :loading="loading" :error="error" compact />

    <!-- Menu cepat -->
    <div>
      <h2 class="mb-3 text-xs font-bold tracking-[0.15em] text-slate-500 uppercase">Menu Cepat</h2>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <router-link
          v-for="card in cards"
          :key="card.to"
          :to="card.to"
          class="group relative overflow-hidden rounded-2xl border border-white bg-white p-6 shadow-card ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
          :class="card.glow"
        >
          <!-- Aksen gradient di atas kartu -->
          <span
            class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            :class="card.iconBg"
            aria-hidden="true"
          />
          <div class="flex items-start justify-between">
            <span
              class="icon-bubble h-12 w-12 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
              :class="card.iconBg"
              aria-hidden="true"
            >
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path :d="card.iconPath" />
              </svg>
            </span>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-emerald-50 group-hover:text-emerald-600">
              <svg
                class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
              >
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
          <h3 class="mt-4 text-base font-extrabold text-slate-800">{{ card.title }}</h3>
          <p class="mt-1 text-sm leading-relaxed text-slate-500">{{ card.desc }}</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
