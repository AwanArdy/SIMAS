<script setup lang="ts">
import type { Kas } from '../../types'
import { formatRupiah, formatTanggalID } from '../../utils/format'
import EmptyState from '../ui/EmptyState.vue'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

defineProps<{
  items: Kas[]
  loading?: boolean
}>()

const emit = defineEmits<{
  cancel: [item: Kas]
}>()
</script>

<template>
  <LoadingSpinner v-if="loading" label="Memuat riwayat kas..." />
  <EmptyState
    v-else-if="items.length === 0"
    icon="wallet"
    title="Belum ada transaksi"
    description="Catat kas masuk atau keluar untuk mulai mencatat arus keuangan."
  />
  <div v-else class="table-wrap">
    <table class="table-base min-w-[760px]">
      <thead class="table-head">
        <tr>
          <th class="table-cell">Tanggal</th>
          <th class="table-cell">Tipe</th>
          <th class="table-cell">Kategori</th>
          <th class="table-cell">Keterangan</th>
          <th class="table-cell text-right">Jumlah</th>
          <th class="table-cell">Status</th>
          <th class="table-cell text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in items"
          :key="row.id"
          class="table-row"
          :class="row.is_cancelled ? 'bg-slate-50/70 text-slate-400' : ''"
        >
          <td class="table-cell whitespace-nowrap">{{ formatTanggalID(row.tanggal) }}</td>
          <td class="table-cell">
            <span class="badge" :class="row.tipe === 'masuk' ? 'badge-success' : 'badge-danger'">
              {{ row.tipe === 'masuk' ? 'Masuk' : 'Keluar' }}
            </span>
          </td>
          <td class="table-cell text-slate-700">{{ row.kategori }}</td>
          <td class="table-cell max-w-[220px] truncate text-slate-500" :title="row.keterangan || ''">
            {{ row.keterangan || '—' }}
          </td>
          <td
            class="table-cell text-right font-semibold whitespace-nowrap tabular-nums"
            :class="[
              row.is_cancelled ? 'line-through text-slate-400' : '',
              !row.is_cancelled && row.tipe === 'masuk' ? 'text-emerald-700' : '',
              !row.is_cancelled && row.tipe === 'keluar' ? 'text-red-600' : '',
            ]"
          >
            {{ row.tipe === 'masuk' ? '+' : '−' }}{{ formatRupiah(row.jumlah) }}
          </td>
          <td class="table-cell">
            <span
              v-if="row.is_cancelled"
              class="badge-neutral"
              :title="row.cancel_reason || ''"
            >
              Dibatalkan
            </span>
            <span v-else class="badge-success">Aktif</span>
          </td>
          <td class="table-cell text-right">
            <button
              v-if="!row.is_cancelled"
              type="button"
              class="action-btn text-red-600 hover:bg-red-50"
              @click="emit('cancel', row)"
            >
              Batalkan
            </button>
            <span v-else class="text-xs text-slate-300">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
