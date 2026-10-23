<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import SaldoCard from '../../components/kas/SaldoCard.vue'
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue'
import EmptyState from '../../components/ui/EmptyState.vue'
import { api, AppError } from '../../services/api'
import type { Kegiatan, SaldoResponse } from '../../types'
import { formatRupiah, formatTanggalID } from '../../utils/format'

const auth = useAuthStore()
const masjidName = import.meta.env.VITE_MASJID_NAME || 'Masjid Al-Ikhlas'

const saldoData = ref<SaldoResponse | null>(null)
const loadingSaldo = ref(false)
const errorSaldo = ref<string | null>(null)

const kegiatanList = ref<Kegiatan[]>([])
const loadingKegiatan = ref(false)
const errorKegiatan = ref<string | null>(null)

async function fetchSaldo() {
  loadingSaldo.value = true
  errorSaldo.value = null
  try {
    saldoData.value = await api<SaldoResponse>('/kas/saldo')
  } catch (err: unknown) {
    errorSaldo.value = err instanceof AppError ? err.message : 'Gagal mengambil data saldo'
  } finally {
    loadingSaldo.value = false
  }
}

async function fetchKegiatan() {
  loadingKegiatan.value = true
  errorKegiatan.value = null
  try {
    kegiatanList.value = await api<Kegiatan[]>('/kegiatan?upcoming=true&limit=10')
  } catch (err: unknown) {
    errorKegiatan.value = err instanceof AppError ? err.message : 'Gagal mengambil jadwal kegiatan'
  } finally {
    loadingKegiatan.value = false
  }
}

onMounted(() => {
  fetchSaldo()
  fetchKegiatan()
})

/** Kegiatan terdekat untuk dekorasi hero */
const nextKegiatan = computed(() => kegiatanList.value[0] ?? null)
const nextKegiatanHari = computed(() => {
  if (!nextKegiatan.value) return ''
  return new Date(nextKegiatan.value.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
    weekday: 'long',
  })
})
const nextKegiatanTanggal = computed(() => {
  if (!nextKegiatan.value) return ''
  return Number(nextKegiatan.value.tanggal.slice(8, 10))
})
const nextKegiatanBulan = computed(() => {
  if (!nextKegiatan.value) return ''
  return new Date(nextKegiatan.value.tanggal + 'T00:00:00')
    .toLocaleDateString('id-ID', { month: 'short' })
    .toUpperCase()
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Hero -->
    <section
      class="panel-brand rounded-3xl px-6 py-12 text-white shadow-xl shadow-emerald-900/25 md:px-12 md:py-16"
    >
      <div class="pattern-islamic absolute inset-0" aria-hidden="true" />
      <div class="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl" aria-hidden="true" />

      <div class="relative max-w-2xl">
        <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-[0.15em] text-amber-300 uppercase ring-1 ring-white/20 backdrop-blur-sm">
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636" />
          </svg>
          Website Resmi
        </span>
        <h1 class="mt-5 text-4xl leading-[1.1] font-extrabold tracking-tight md:text-5xl">
          Selamat Datang di
          <span class="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            {{ masjidName }}
          </span>
        </h1>
        <p class="mt-4 text-base leading-relaxed text-emerald-50/90 md:text-lg">
          Mari bersama-sama memakmurkan masjid. Cek agenda kegiatan terdekat dan transparansi kas di halaman ini.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a
            href="#agenda"
            class="btn bg-gradient-to-b from-amber-300 to-amber-500 text-emerald-950 shadow-glow-amber hover:from-amber-200 hover:to-amber-400"
          >
            Lihat Agenda
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
          <router-link
            v-if="!auth.isAuthenticated"
            to="/login"
            class="btn bg-white/10 text-white ring-1 ring-white/30 backdrop-blur-sm hover:bg-white/20"
          >
            Login Pengurus
          </router-link>
        </div>
      </div>

      <!-- Dekorasi sisi kanan: siluet masjid + kartu glass mengambang -->
      <div
        class="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] items-center justify-end xl:flex"
        aria-hidden="true"
      >
        <!-- Siluet masjid -->
        <svg
          class="absolute right-4 bottom-0 w-[400px] text-white/15"
          viewBox="0 0 440 300"
          fill="currentColor"
        >
          <!-- Menara kiri -->
          <rect x="92" y="92" width="20" height="168" rx="10" />
          <rect x="84" y="150" width="36" height="10" rx="5" />
          <path d="M102 52c-9 10-14 20-14 32 0 6 6 10 14 10s14-4 14-10c0-12-5-22-14-32z" />
          <path d="M102 38l3 14h-6l3-14z" />
          <!-- Menara kanan -->
          <rect x="328" y="92" width="20" height="168" rx="10" />
          <rect x="320" y="150" width="36" height="10" rx="5" />
          <path d="M338 52c-9 10-14 20-14 32 0 6 6 10 14 10s14-4 14-10c0-12-5-22-14-32z" />
          <path d="M338 38l3 14h-6l3-14z" />
          <!-- Kubah utama -->
          <path d="M220 44c-44 24-70 58-70 96h140c0-38-26-72-70-96z" />
          <circle cx="220" cy="34" r="7" />
          <path d="M220 18l4 12h-8l4-12z" />
          <!-- Bangunan utama -->
          <rect x="128" y="140" width="184" height="120" rx="10" />
          <!-- Pintu lengkung -->
          <path
            d="M220 176c-17 0-28 13-28 30v54h56v-54c0-17-11-30-28-30z"
            class="fill-emerald-950/40"
          />
          <!-- Jendela -->
          <path d="M158 192c-9 0-15 7-15 16v22h30v-22c0-9-6-16-15-16z" class="fill-emerald-950/25" />
          <path d="M282 192c-9 0-15 7-15 16v22h30v-22c0-9-6-16-15-16z" class="fill-emerald-950/25" />
        </svg>

        <!-- Kartu glass: agenda terdekat -->
        <div
          class="animate-float relative z-10 mr-10 mt-[-70px] w-72 rounded-2xl border border-white/25 bg-white/10 p-4 shadow-2xl backdrop-blur-md"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white/90 text-emerald-800 shadow-md"
            >
              <span class="text-xl leading-none font-extrabold">{{ nextKegiatanTanggal || '—' }}</span>
              <span class="mt-0.5 text-[10px] font-bold tracking-wide uppercase">{{ nextKegiatanBulan || '' }}</span>
            </div>
            <div class="min-w-0">
              <p class="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.15em] text-amber-300 uppercase">
                <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {{ nextKegiatanHari || 'Agenda' }}
              </p>
              <p class="mt-1 truncate text-sm font-bold text-white">
                {{ nextKegiatan?.nama_kegiatan || 'Belum ada agenda terdekat' }}
              </p>
              <p v-if="nextKegiatan" class="mt-0.5 flex items-center gap-1 text-xs text-emerald-100">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ nextKegiatan.waktu }} · {{ nextKegiatan.lokasi }}
              </p>
            </div>
          </div>
        </div>

        <!-- Kartu glass: saldo kas -->
        <div
          class="animate-float-delay absolute bottom-16 right-40 z-10 flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-2xl backdrop-blur-md"
        >
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/90 text-emerald-950 shadow-md">
            <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div>
            <p class="text-[10px] font-bold tracking-[0.15em] text-emerald-100 uppercase">Saldo Kas</p>
            <p class="text-base font-extrabold text-white tabular-nums">
              {{ formatRupiah(saldoData?.saldo ?? 0) }}
            </p>
          </div>
        </div>

        <!-- Chip: jumlah agenda -->
        <div
          class="animate-float absolute top-16 right-6 z-10 flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 shadow-xl backdrop-blur-md"
        >
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
          </span>
          <span class="text-xs font-bold text-white">{{ kegiatanList.length }} kegiatan mendatang</span>
        </div>
      </div>
    </section>

    <!-- Transparansi kas -->
    <section aria-label="Transparansi kas">
      <SaldoCard :data="saldoData" :loading="loadingSaldo" :error="errorSaldo" />
    </section>

    <!-- Agenda -->
    <section id="agenda" class="card" aria-label="Agenda kegiatan">
      <div class="card-header">
        <h2 class="card-title text-lg">Agenda Kegiatan Terdekat</h2>
        <span v-if="!loadingKegiatan && !errorKegiatan" class="text-sm text-slate-400">
          {{ kegiatanList.length }} kegiatan mendatang
        </span>
      </div>

      <div class="p-5 md:p-6">
        <p v-if="errorKegiatan" class="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {{ errorKegiatan }}
        </p>

        <LoadingSpinner v-else-if="loadingKegiatan" label="Memuat agenda..." />

        <EmptyState
          v-else-if="kegiatanList.length === 0"
          icon="calendar"
          title="Belum ada agenda terdekat"
          description="Jadwal kajian dan kegiatan masjid akan ditampilkan di sini."
        />

        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="item in kegiatanList"
            :key="item.id"
            class="group rounded-2xl border border-white bg-white p-5 shadow-card ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:ring-emerald-500/20"
          >
            <div class="flex items-start gap-4">
              <!-- Badge tanggal gradient -->
              <div class="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-transform duration-300 group-hover:scale-105">
                <span class="text-xl leading-none font-extrabold">{{ Number(item.tanggal.slice(8, 10)) }}</span>
                <span class="mt-0.5 text-[10px] font-bold tracking-wide uppercase">
                  {{ new Date(item.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' }) }}
                </span>
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-slate-800 group-hover:text-emerald-700">
                  {{ item.nama_kegiatan }}
                </h3>
                <p class="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ item.waktu }}
                </p>
                <p class="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <svg class="h-4 w-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span class="truncate">{{ item.lokasi }}</span>
                </p>
                <p v-if="item.pemateri" class="mt-1 text-sm text-slate-500">
                  Pemateri: <span class="font-medium text-slate-600">{{ item.pemateri }}</span>
                </p>
              </div>
            </div>
            <p v-if="item.keterangan" class="mt-3 line-clamp-2 border-t border-slate-100 pt-3 text-sm text-slate-500">
              {{ item.keterangan }}
            </p>
            <p class="mt-2 text-xs text-slate-400">{{ formatTanggalID(item.tanggal) }}</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
