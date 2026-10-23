<script setup lang="ts">
import type { Kegiatan } from '../../types'
import { formatTanggalID } from '../../utils/format'
import EmptyState from '../ui/EmptyState.vue'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

withDefaults(
  defineProps<{
    items: Kegiatan[]
    loading?: boolean
    /** admin: tampilkan aksi edit/hapus */
    variant?: 'public' | 'admin'
  }>(),
  { variant: 'public' },
)

const emit = defineEmits<{
  edit: [item: Kegiatan]
  remove: [item: Kegiatan]
}>()
</script>

<template>
  <LoadingSpinner v-if="loading" label="Memuat kegiatan..." />
  <EmptyState
    v-else-if="items.length === 0"
    icon="calendar"
    title="Belum ada kegiatan"
    description="Agenda kegiatan masjid akan ditampilkan di sini."
  />
  <div v-else class="table-wrap">
    <table class="table-base min-w-[680px]">
      <thead class="table-head">
        <tr>
          <th class="table-cell">Waktu</th>
          <th class="table-cell">Nama Kegiatan</th>
          <th class="table-cell">Pemateri</th>
          <th class="table-cell">Lokasi</th>
          <th v-if="variant === 'admin'" class="table-cell text-right">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in items" :key="row.id" class="table-row">
          <td class="table-cell whitespace-nowrap">
            <div class="font-semibold text-slate-800">{{ formatTanggalID(row.tanggal) }}</div>
            <div class="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ row.waktu }}
            </div>
          </td>
          <td class="table-cell">
            <div class="font-semibold text-slate-800">{{ row.nama_kegiatan }}</div>
            <div v-if="row.keterangan" class="mt-1 line-clamp-2 text-sm text-slate-500">
              {{ row.keterangan }}
            </div>
          </td>
          <td class="table-cell text-slate-700">{{ row.pemateri || '—' }}</td>
          <td class="table-cell text-slate-600">{{ row.lokasi }}</td>
          <td v-if="variant === 'admin'" class="table-cell text-right whitespace-nowrap">
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
