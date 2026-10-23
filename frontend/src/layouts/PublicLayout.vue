<script setup lang="ts">
import PublicNavbar from '../components/layout/PublicNavbar.vue'

const masjidName = import.meta.env.VITE_MASJID_NAME || 'SIMAS'
const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-slate-100 via-slate-50 to-emerald-50/40">
    <PublicNavbar />

    <main class="mx-auto container flex-1 px-4 py-8">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <footer class="border-t border-slate-200 bg-white py-5">
      <div class="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row">
        <p>&copy; {{ year }} {{ masjidName }} · SIMAS</p>
        <p class="text-xs text-slate-400">Sistem Informasi Manajemen Masjid</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page-enter-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-leave-active {
  transition: opacity 0.1s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
}
</style>
