<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const masjidName = import.meta.env.VITE_MASJID_NAME || 'SIMAS'
</script>

<template>
  <header class="sticky top-0 z-20 bg-gradient-to-r from-emerald-900 to-emerald-700 text-white shadow-lg shadow-emerald-900/20">
    <div class="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
      <router-link to="/" class="flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
        <span
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-sm font-black text-emerald-950 shadow-glow-amber"
          aria-hidden="true"
        >
          S
        </span>
        <span>
          SIMAS
          <span class="hidden font-medium text-emerald-200 sm:inline">· {{ masjidName }}</span>
        </span>
      </router-link>

      <nav class="flex items-center gap-1 text-sm sm:gap-2" aria-label="Navigasi utama">
        <router-link
          to="/"
          class="rounded-lg px-3 py-2 font-medium text-emerald-100 transition-colors hover:bg-white/10 hover:text-white"
          exact-active-class="bg-white/15 text-white"
        >
          Beranda
        </router-link>

        <router-link
          v-if="!auth.isAuthenticated"
          to="/login"
          class="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 font-bold text-emerald-950 shadow-glow-amber transition-all hover:from-amber-200 hover:to-amber-400 active:scale-95"
        >
          Login Pengurus
        </router-link>
        <router-link
          v-else
          to="/dashboard"
          class="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-2 font-bold text-emerald-950 shadow-glow-amber transition-all hover:from-amber-200 hover:to-amber-400 active:scale-95"
        >
          Dashboard
        </router-link>
      </nav>
    </div>
  </header>
</template>
