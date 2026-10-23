<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Kegiatan, KegiatanInput } from '../../types'
import { todayISO } from '../../utils/format'

const props = defineProps<{
  initial?: Kegiatan | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: KegiatanInput]
  cancel: []
}>()

const form = reactive({
  nama_kegiatan: '',
  tanggal: todayISO(),
  waktu: '',
  lokasi: '',
  pemateri: '',
  keterangan: '',
})

const errors = ref<Record<string, string>>({})

function fillFrom(initial?: Kegiatan | null) {
  if (initial) {
    form.nama_kegiatan = initial.nama_kegiatan
    form.tanggal = initial.tanggal
    form.waktu = initial.waktu
    form.lokasi = initial.lokasi
    form.pemateri = initial.pemateri || ''
    form.keterangan = initial.keterangan || ''
  } else {
    form.nama_kegiatan = ''
    form.tanggal = todayISO()
    form.waktu = ''
    form.lokasi = ''
    form.pemateri = ''
    form.keterangan = ''
  }
  errors.value = {}
}

watch(
  () => props.initial,
  (val) => fillFrom(val),
  { immediate: true },
)

function validate(): boolean {
  const e: Record<string, string> = {}
  if (!form.nama_kegiatan || form.nama_kegiatan.trim().length < 3) {
    e.nama_kegiatan = 'Nama kegiatan minimal 3 karakter'
  }
  if (!form.tanggal || !/^\d{4}-\d{2}-\d{2}$/.test(form.tanggal)) {
    e.tanggal = 'Tanggal wajib diisi (YYYY-MM-DD)'
  }
  if (!form.waktu.trim()) e.waktu = 'Waktu wajib diisi'
  if (!form.lokasi.trim()) e.lokasi = 'Lokasi wajib diisi'
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    nama_kegiatan: form.nama_kegiatan.trim(),
    tanggal: form.tanggal,
    waktu: form.waktu.trim(),
    lokasi: form.lokasi.trim(),
    pemateri: form.pemateri.trim() || null,
    keterangan: form.keterangan.trim() || null,
  })
}

function reset() {
  fillFrom(null)
}

defineExpose({ reset })
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="label-text" for="keg-nama">Nama kegiatan <span class="text-red-500">*</span></label>
        <input
          id="keg-nama"
          v-model="form.nama_kegiatan"
          type="text"
          maxlength="200"
          class="input"
          :class="errors.nama_kegiatan ? 'input-error' : ''"
          placeholder="Contoh: Kajian Rutin Ahad"
        />
        <p v-if="errors.nama_kegiatan" class="field-error">{{ errors.nama_kegiatan }}</p>
      </div>

      <div>
        <label class="label-text" for="keg-tanggal">Tanggal <span class="text-red-500">*</span></label>
        <input
          id="keg-tanggal"
          v-model="form.tanggal"
          type="date"
          class="input"
          :class="errors.tanggal ? 'input-error' : ''"
        />
        <p v-if="errors.tanggal" class="field-error">{{ errors.tanggal }}</p>
      </div>

      <div>
        <label class="label-text" for="keg-waktu">Waktu <span class="text-red-500">*</span></label>
        <input
          id="keg-waktu"
          v-model="form.waktu"
          type="text"
          class="input"
          :class="errors.waktu ? 'input-error' : ''"
          placeholder="08:00 atau Ba'da Maghrib"
        />
        <p v-if="errors.waktu" class="field-error">{{ errors.waktu }}</p>
      </div>

      <div>
        <label class="label-text" for="keg-lokasi">Lokasi <span class="text-red-500">*</span></label>
        <input
          id="keg-lokasi"
          v-model="form.lokasi"
          type="text"
          maxlength="200"
          class="input"
          :class="errors.lokasi ? 'input-error' : ''"
          placeholder="Aula Masjid"
        />
        <p v-if="errors.lokasi" class="field-error">{{ errors.lokasi }}</p>
      </div>

      <div>
        <label class="label-text" for="keg-pemateri">Pemateri</label>
        <input
          id="keg-pemateri"
          v-model="form.pemateri"
          type="text"
          maxlength="150"
          class="input"
          placeholder="Opsional"
        />
      </div>

      <div class="sm:col-span-2">
        <label class="label-text" for="keg-ket">Keterangan</label>
        <textarea
          id="keg-ket"
          v-model="form.keterangan"
          rows="3"
          maxlength="2000"
          class="input resize-y"
          placeholder="Opsional"
        />
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
      <button
        v-if="initial"
        type="button"
        class="btn-secondary"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Batal Edit
      </button>
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
        {{ loading ? 'Menyimpan...' : initial ? 'Perbarui Kegiatan' : 'Tambah Kegiatan' }}
      </button>
    </div>
  </form>
</template>
