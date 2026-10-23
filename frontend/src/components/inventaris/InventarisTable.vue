<script setup lang="ts">
import type { Inventaris, Kondisi } from '../../types'
import { labelKondisi, labelStatusPinjam } from '../../utils/format'
import EmptyState from '../ui/EmptyState.vue'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

defineProps<{
  items: Inventaris[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [item: Inventaris]
  remove: [item: Inventaris]
  togglePinjam: [item: Inventaris]
  setKondisi: [item: Inventaris, kondisi: Kondisi]
}>()

function kondisiClass(kondisi: string) {
  if (kondisi === 'baik') return 'badge-success'
  if (kondisi === 'rusak') return 'badge-danger'
  return 'badge-warning'
}

function pinjamClass(status: string) {
  return status === 'dipinjam' ? 'badge-warning' : 'badge-success'
}
</script>

<template>
  <LoadingSpinner v-if="loading" label="Memuat inventaris..." />
  <EmptyState
    v-else-if="items.length === 0"
    icon="box"
    title="Belum ada inventaris"
    description="Tambahkan barang aset masjid untuk mulai melacak kondisi dan peminjaman."
  />
  <div v-else class="table-wrap">
    <table class="table-base min-w-[780px]">
      <thead class="table-head">
        <tr>
          <th class="table-cell">Nama Barang</th>
          <th class="table-cell">Jumlah</th>
          <th class="table-cell">Kondisi</th>
          <th class="table-cell">Status</th>
          <th class="table-cell">Lokasi</th>
          <th class="table-cell text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id" class="table-row">
          <td class="table-cell font-medium text-slate-800">{{ row.nama_barang }}</td>
          <td class="table-cell tabular-nums text-slate-700">{{ row.jumlah }}</td>
          <td class="table-cell">
            <select
              class="cursor-pointer rounded-md border border-transparent bg-transparent px-1.5 py-1 text-xs font-semibold transition-colors hover:bg-slate-50 focus:border-emerald-600 focus:outline-none"
              :class="kondisiClass(row.kondisi)"
              :value="row.kondisi"
              :aria-label="`Kondisi ${row.nama_barang}`"
              @change="
                emit(
                  'setKondisi',
                  row,
                  ($event.target as HTMLSelectElement).value as Kondisi,
                )
              "
            >
              <option value="baik">{{ labelKondisi('baik') }}</option>
              <option value="rusak">{{ labelKondisi('rusak') }}</option>
              <option value="perlu_perbaikan">{{ labelKondisi('perlu_perbaikan') }}</option>
            </select>
          </td>
          <td class="table-cell">
            <span class="badge" :class="pinjamClass(row.status_pinjam)">
              {{ labelStatusPinjam(row.status_pinjam) }}
            </span>
          </td>
          <td class="table-cell text-slate-600">{{ row.lokasi_penyimpanan || '—' }}</td>
          <td class="table-cell text-right whitespace-nowrap">
            <button
              type="button"
              class="action-btn bg-amber-100 text-amber-700 hover:bg-amber-200"
              @click="emit('togglePinjam', row)"
            >
              {{ row.status_pinjam === 'tersedia' ? 'Pinjam' : 'Kembalikan' }}
            </button>
            <button
              type="button"
              class="action-btn text-emerald-700 hover:bg-emerald-50"
              @click="emit('edit', row)"
            >
              Ubah
            </button>
            <button
              type="button"
              class="action-btn text-red-600 hover:bg-red-50"
              @click="emit('remove', row)"
            >
              Hapus
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
