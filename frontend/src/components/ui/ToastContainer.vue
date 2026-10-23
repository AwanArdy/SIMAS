<script setup lang="ts">
import { useToastStore } from '../../stores/toast'

const toast = useToastStore()

const styles: Record<
  string,
  { wrapper: string; iconBg: string; iconPath: string }
> = {
  success: {
    wrapper: 'border-emerald-600/20 bg-white text-slate-800',
    iconBg: 'bg-emerald-100 text-emerald-700',
    iconPath: 'M4.5 12.75l6 6 9-13.5',
  },
  error: {
    wrapper: 'border-red-600/20 bg-white text-slate-800',
    iconBg: 'bg-red-100 text-red-600',
    iconPath: 'M6 18L18 6M6 6l12 12',
  },
  info: {
    wrapper: 'border-slate-600/20 bg-white text-slate-800',
    iconBg: 'bg-slate-100 text-slate-600',
    iconPath: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z',
  },
}
</script>

<template>
  <div class="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-full max-w-sm flex-col gap-2">
    <div
      v-for="item in toast.items"
      :key="item.id"
      class="animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg"
      :class="styles[item.type]?.wrapper"
      role="status"
    >
      <span
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        :class="styles[item.type]?.iconBg"
        aria-hidden="true"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path :d="styles[item.type]?.iconPath" />
        </svg>
      </span>
      <p class="flex-1 pt-0.5 text-sm font-medium">{{ item.message }}</p>
      <button
        type="button"
        class="shrink-0 cursor-pointer rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        aria-label="Tutup notifikasi"
        @click="toast.dismiss(item.id)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>
