<script setup lang="ts">
import { ref } from 'vue'
import SidebarNav from '../components/layout/SidebarNav.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-slate-100 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-emerald-100/60 via-slate-100 to-slate-100">
    <SidebarNav :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Mobile top bar -->
      <header
        class="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden"
      >
        <button
          type="button"
          class="rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50"
          aria-label="Buka menu"
          @click="sidebarOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span class="font-bold text-emerald-800">SIMAS Admin</span>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-10 md:py-10">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
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
