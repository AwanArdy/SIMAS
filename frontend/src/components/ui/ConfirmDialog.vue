<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
    requireReason?: boolean
    reasonLabel?: string
    reasonPlaceholder?: string
    loading?: boolean
  }>(),
  {
    title: 'Konfirmasi',
    message: 'Apakah Anda yakin?',
    confirmLabel: 'Ya, lanjutkan',
    cancelLabel: 'Batal',
    danger: false,
    requireReason: false,
    reasonLabel: 'Alasan',
    reasonPlaceholder: 'Tuliskan alasan...',
    loading: false,
  },
)

const emit = defineEmits<{
  close: []
  confirm: [reason: string]
}>()

const reason = ref('')
const reasonError = ref('')
const reasonInput = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.open,
  (val) => {
    if (val) {
      reason.value = ''
      reasonError.value = ''
      requestAnimationFrame(() => reasonInput.value?.focus())
    }
  },
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.loading) emit('close')
}

function onConfirm() {
  if (props.requireReason) {
    if (reason.value.trim().length < 3) {
      reasonError.value = 'Alasan minimal 3 karakter'
      return
    }
  }
  emit('confirm', reason.value.trim())
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @keydown="onKeydown"
    >
      <div class="animate-overlay-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs" @click="emit('close')" />
      <div class="animate-dialog-in relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div class="flex items-start gap-4">
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            :class="danger ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'"
            aria-hidden="true"
          >
            <svg v-if="danger" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <svg v-else class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-slate-600">{{ message }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Tutup"
            :disabled="loading"
            @click="emit('close')"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="requireReason" class="mt-5">
          <label class="label-text" for="confirm-reason">{{ reasonLabel }}</label>
          <textarea
            id="confirm-reason"
            ref="reasonInput"
            v-model="reason"
            rows="3"
            :placeholder="reasonPlaceholder"
            class="input"
            :class="reasonError ? 'input-error' : ''"
          />
          <p v-if="reasonError" class="field-error">{{ reasonError }}</p>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn-secondary"
            :disabled="loading"
            @click="emit('close')"
          >
            {{ cancelLabel }}
          </button>
          <button
            type="button"
            class="btn"
            :class="danger ? 'btn-danger' : 'btn-primary'"
            :disabled="loading"
            @click="onConfirm"
          >
            <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            {{ loading ? 'Memproses...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
