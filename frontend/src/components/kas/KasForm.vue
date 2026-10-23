<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { KasInput, KasTipe } from '../../types'
import { KATEGORI_KELUAR, KATEGORI_MASUK } from '../../types'
import { todayISO } from '../../utils/format'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: KasInput]
}>()

const form = reactive({
  tipe: 'masuk' as KasTipe,
  kategori: KATEGORI_MASUK[0] as string,
  jumlah: '' as string | number,
  keterangan: '',
  tanggal: todayISO(),
  bukti_nota: '',
})

const errors = ref<Record<string, string>>({})

const kategoriOptions = computed(() =>
  form.tipe === 'masuk' ? [...KATEGORI_MASUK] : [...KATEGORI_KELUAR],
)

watch(
  () => form.tipe,
  () => {
    form.kategori = kategoriOptions.value[0]
  },
)

function validate(): boolean {
  const e: Record<string, string> = {}
  const jumlah = Number(form.jumlah)

  if (!form.tipe) e.tipe = 'Tipe wajib dipilih'
  if (!form.kategori) e.kategori = 'Kategori wajib diisi'
  if (!Number.isInteger(jumlah) || jumlah <= 0) {
    e.jumlah = 'Jumlah harus bilangan bulat lebih dari 0'
  }
  if (!form.tanggal || !/^\d{4}-\d{2}-\d{2}$/.test(form.tanggal)) {
    e.tanggal = 'Tanggal tidak valid'
  }

  errors.value = e
  return Object.keys(e).length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', {
    tipe: form.tipe,
    kategori: form.kategori,
    jumlah: Number(form.jumlah),
    keterangan: form.keterangan || null,
    tanggal: form.tanggal,
    bukti_nota: form.bukti_nota || null,
  })
}

function reset() {
  form.tipe = 'masuk'
  form.kategori = KATEGORI_MASUK[0]
  form.jumlah = ''
  form.keterangan = ''
  form.tanggal = todayISO()
  form.bukti_nota = ''
  errors.value = {}
}

defineExpose({ reset })
</script>

<template>
  <form class="space-y-5" @submit.prevent="onSubmit">
    <div class="grid gap-5 sm:grid-cols-2">
      <fieldset>
        <legend class="label-text">Tipe transaksi <span class="text-red-500">*</span></legend>
        <div class="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-all"
            :class="
              form.tipe === 'masuk'
                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-600/20'
                : 'text-slate-500 hover:text-slate-700'
            "
            :aria-pressed="form.tipe === 'masuk'"
            @click="form.tipe = 'masuk'"
          >
            ↓ Masuk
          </button>
          <button
            type="button"
            class="cursor-pointer rounded-md px-3 py-2 text-sm font-semibold transition-all"
            :class="
              form.tipe === 'keluar'
                ? 'bg-white text-red-600 shadow-sm ring-1 ring-red-600/20'
                : 'text-slate-500 hover:text-slate-700'
            "
            :aria-pressed="form.tipe === 'keluar'"
            @click="form.tipe = 'keluar'"
          >
            ↑ Keluar
          </button>
        </div>
      </fieldset>

      <div>
        <label for="kas-kategori" class="label-text">Kategori <span class="text-red-500">*</span></label>
        <select id="kas-kategori" v-model="form.kategori" class="input">
          <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
        </select>
        <p v-if="errors.kategori" class="field-error">{{ errors.kategori }}</p>
      </div>

      <div>
        <label for="kas-jumlah" class="label-text">Jumlah (Rp) <span class="text-red-500">*</span></label>
        <div class="relative">
          <span class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-slate-400">Rp</span>
          <input
            id="kas-jumlah"
            v-model="form.jumlah"
            type="number"
            min="1"
            step="1"
            placeholder="150000"
            class="input pl-10"
            :class="errors.jumlah ? 'input-error' : ''"
          />
        </div>
        <p v-if="errors.jumlah" class="field-error">{{ errors.jumlah }}</p>
      </div>

      <div>
        <label for="kas-tanggal" class="label-text">Tanggal <span class="text-red-500">*</span></label>
        <input
          id="kas-tanggal"
          v-model="form.tanggal"
          type="date"
          class="input"
          :class="errors.tanggal ? 'input-error' : ''"
        />
        <p v-if="errors.tanggal" class="field-error">{{ errors.tanggal }}</p>
      </div>

      <div class="sm:col-span-2">
        <label for="kas-ket" class="label-text">Keterangan</label>
        <input
          id="kas-ket"
          v-model="form.keterangan"
          type="text"
          placeholder="Opsional — contoh: Infaq Jumat berjatuhan"
          class="input"
        />
      </div>

      <div class="sm:col-span-2">
        <label for="kas-bukti" class="label-text">Bukti nota (path/URL)</label>
        <input
          id="kas-bukti"
          v-model="form.bukti_nota"
          type="text"
          placeholder="Opsional — path atau URL"
          class="input"
        />
      </div>
    </div>

    <div class="flex justify-end border-t border-slate-100 pt-4">
      <button type="submit" class="btn-primary" :disabled="loading">
        <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
        {{ loading ? 'Menyimpan...' : 'Simpan Transaksi' }}
      </button>
    </div>
  </form>
</template>
