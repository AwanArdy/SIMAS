<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Inventaris, InventarisInput, Kondisi, StatusPinjam } from '../../types'
import { labelKondisi } from '../../utils/format'

const props = defineProps<{
  initial?: Inventaris | null
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: InventarisInput]
  cancel: []
}>()

const form = reactive({
  nama_barang: '',
  jumlah: 1 as number | string,
  kondisi: 'baik' as Kondisi,
  status_pinjam: 'tersedia' as StatusPinjam,
  lokasi_penyimpanan: '',
})

const errors = ref<Record<string, string>>({})

function fillFrom(initial?: Inventaris | null) {
  if (initial) {
    form.nama_barang = initial.nama_barang
    form.jumlah = initial.jumlah
    form.kondisi = initial.kondisi
    form.status_pinjam = initial.status_pinjam
    form.lokasi_penyimpanan = initial.lokasi_penyimpanan || ''
  } else {
    form.nama_barang = ''
    form.jumlah = 1
    form.kondisi = 'baik'
    form.status_pinjam = 'tersedia'
    form.lokasi_penyimpanan = ''
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
  if (!form.nama_barang || form.nama_barang.trim().length < 2) {
    e.nama_barang = 'Nama barang minimal 2 karakter'
  }
  const jumlah = Number(form.jumlah)
  if (!Number.isInteger(jumlah) || jumlah < 1) {
    e.jumlah = 'Jumlah minimal 1'
  }
  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    nama_barang: form.nama_barang.trim(),
    jumlah: Number(form.jumlah),
    kondisi: form.kondisi,
    status_pinjam: form.status_pinjam,
    lokasi_penyimpanan: form.lokasi_penyimpanan.trim() || null,
  })
}

defineExpose({ reset: () => fillFrom(null) })
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid gap-5 sm:grid-cols-2">
      <div class="sm:col-span-2">
        <label class="label-text" for="inv-nama">Nama barang <span class="text-red-500">*</span></label>
        <input
          id="inv-nama"
          v-model="form.nama_barang"
          type="text"
          maxlength="150"
          class="input"
          :class="errors.nama_barang ? 'input-error' : ''"
          placeholder="Contoh: Sound System"
        />
        <p v-if="errors.nama_barang" class="field-error">{{ errors.nama_barang }}</p>
      </div>

      <div>
        <label class="label-text" for="inv-jumlah">Jumlah <span class="text-red-500">*</span></label>
        <input
          id="inv-jumlah"
          v-model="form.jumlah"
          type="number"
          min="1"
          step="1"
          class="input"
          :class="errors.jumlah ? 'input-error' : ''"
        />
        <p v-if="errors.jumlah" class="field-error">{{ errors.jumlah }}</p>
      </div>

      <div>
        <label class="label-text" for="inv-lokasi">Lokasi penyimpanan</label>
        <input
          id="inv-lokasi"
          v-model="form.lokasi_penyimpanan"
          type="text"
          maxlength="150"
          class="input"
          placeholder="Opsional — contoh: Gudang lantai 2"
        />
      </div>

      <div>
        <label class="label-text" for="inv-kondisi">Kondisi</label>
        <select id="inv-kondisi" v-model="form.kondisi" class="input">
          <option value="baik">{{ labelKondisi('baik') }}</option>
          <option value="rusak">{{ labelKondisi('rusak') }}</option>
          <option value="perlu_perbaikan">{{ labelKondisi('perlu_perbaikan') }}</option>
        </select>
      </div>

      <div>
        <label class="label-text" for="inv-status">Status pinjam</label>
        <select id="inv-status" v-model="form.status_pinjam" class="input">
          <option value="tersedia">Tersedia</option>
          <option value="dipinjam">Dipinjam</option>
        </select>
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
        {{ loading ? 'Menyimpan...' : initial ? 'Perbarui Barang' : 'Tambah Barang' }}
      </button>
    </div>
  </form>
</template>
