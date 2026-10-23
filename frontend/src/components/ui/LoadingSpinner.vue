<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { label: 'Memuat...', size: 'md' },
)

const sizeClass = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 py-10 text-slate-500">
    <div
      class="animate-spin rounded-full border-emerald-700/25 border-t-emerald-700"
      :class="sizeClass[size]"
      role="status"
      aria-label="sedang memuat"
    />
    <p v-if="label" class="text-sm">{{ label }}</p>
  </div>
</template>
