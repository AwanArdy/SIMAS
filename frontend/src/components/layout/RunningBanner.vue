<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: 'Selamat datang di website resmi masjid. Mari bersama-sama memakmurkan masjid.',
  },
)
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-emerald-800 text-white shadow-md">
    <div class="flex items-center gap-3 px-4 py-3">
      <span class="shrink-0 rounded bg-amber-500 px-2 py-0.5 text-xs font-bold tracking-wide">
        INFO
      </span>
      <div class="min-w-0 flex-1 overflow-hidden">
        <p class="truncate text-sm md:text-base">{{ text }}</p>
      </div>
    </div>
  </div>
</template>
