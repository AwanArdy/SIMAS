<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const props = defineProps<{
  open?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const links = [
  {
    to: '/dashboard',
    name: 'dashboard',
    label: 'Overview',
    exact: true,
    iconPath:
      'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  },
  {
    to: '/dashboard/kegiatan',
    name: 'dashboard-kegiatan',
    label: 'Kegiatan',
    iconPath: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
  {
    to: '/dashboard/kas',
    name: 'dashboard-kas',
    label: 'Kas',
    iconPath:
      'M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    to: '/dashboard/inventaris',
    name: 'dashboard-inventaris',
    label: 'Inventaris',
    iconPath:
      'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  },
]

function isActive(link: (typeof links)[0]) {
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

const displayName = computed(() => auth.user?.username || 'Pengurus')
const initial = computed(() => displayName.value.charAt(0).toUpperCase())
const roleLabel = computed(() => {
  const role = auth.user?.role
  if (!role) return 'Pengurus'
  return role.charAt(0).toUpperCase() + role.slice(1)
})
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-emerald-950/60 backdrop-blur-sm lg:hidden"
      @click="emit('close')"
    />
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white shadow-2xl shadow-emerald-950/30 transition-transform duration-300 ease-out lg:static lg:shadow-none lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
  >
    <!-- Glow dekoratif -->
    <div class="pattern-islamic pointer-events-none absolute inset-0" aria-hidden="true" />
    <div class="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden="true" />

    <!-- Header brand -->
    <div class="relative flex items-center gap-3 px-5 py-6">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-black text-emerald-950 shadow-glow-amber"
      >
        S
      </div>
      <div class="min-w-0">
        <div class="text-lg leading-tight font-extrabold tracking-tight">
          SIMAS <span class="text-amber-400">Admin</span>
        </div>
        <p class="text-[11px] font-medium text-emerald-400">Manajemen Masjid</p>
      </div>
      <button
        type="button"
        class="ml-auto cursor-pointer rounded-lg p-1.5 text-emerald-300 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        aria-label="Tutup menu"
        @click="emit('close')"
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Kartu profil pengguna -->
    <div class="relative px-4 pb-2">
      <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 backdrop-blur-sm">
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-sm font-extrabold uppercase ring-2 ring-emerald-400/30"
          aria-hidden="true"
        >
          {{ initial }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold">{{ displayName }}</p>
          <p class="text-xs text-emerald-300">{{ roleLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Navigasi utama -->
    <nav class="relative flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Menu dashboard">
      <p class="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
        Menu Utama
      </p>
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200"
        :class="
          isActive(link)
            ? 'bg-gradient-to-r from-white/15 to-white/5 text-white shadow-sm ring-1 ring-white/10'
            : 'text-emerald-100/70 hover:bg-white/5 hover:text-white'
        "
        @click="emit('close')"
      >
        <span
          class="absolute top-1/2 left-0 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-glow-amber transition-opacity duration-200"
          :class="isActive(link) ? 'opacity-100' : 'opacity-0'"
          aria-hidden="true"
        />
        <span
          class="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
          :class="
            isActive(link)
              ? 'bg-amber-400/20 text-amber-300 ring-1 ring-amber-400/30'
              : 'text-emerald-300/80 group-hover:bg-white/10 group-hover:text-white'
          "
        >
          <svg
            class="h-4.5 w-4.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path :d="link.iconPath" />
          </svg>
        </span>
        {{ link.label }}
      </router-link>
    </nav>

    <!-- Bagian bawah -->
    <div class="relative space-y-1 border-t border-white/10 p-3">
      <router-link
        to="/"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/70 transition-colors hover:bg-white/5 hover:text-white"
        @click="emit('close')"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-300/80">
          <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        </span>
        Lihat Situs Publik
      </router-link>
      <button
        type="button"
        class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-200/80 transition-colors hover:bg-red-500/15 hover:text-red-100"
        @click="handleLogout"
      >
        <span class="flex h-8 w-8 items-center justify-center rounded-lg">
          <svg class="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
        </span>
        Keluar
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
