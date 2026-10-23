<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import InventarisForm from '../../components/inventaris/InventarisForm.vue'
import InventarisTable from '../../components/inventaris/InventarisTable.vue'
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue'
import { useInventarisStore } from '../../stores/inventaris'
import { useToastStore } from '../../stores/toast'
import type { Inventaris, InventarisInput, Kondisi } from '../../types'
import { AppError } from '../../services/api'

const store = useInventarisStore()
const toast = useToastStore()

const formRef = ref<InstanceType<typeof InventarisForm> | null>(null)
const editing = ref<Inventaris | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const deleteOpen = ref(false)
const deleteTarget = ref<Inventaris | null>(null)

async function load() {
  try {
    await store.fetchAll()
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal memuat inventaris')
  }
}

onMounted(load)

watch([() => store.filterKondisi, () => store.filterStatus], () => {
  load()
})

async function onSubmit(payload: InventarisInput) {
  submitting.value = true
  try {
    if (editing.value) {
      await store.update(editing.value.id, payload)
      toast.success('Inventaris diperbarui')
      editing.value = null
    } else {
      await store.create(payload)
      toast.success('Barang ditambahkan')
      formRef.value?.reset()
    }
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal menyimpan inventaris')
  } finally {
    submitting.value = false
  }
}

function onEdit(item: Inventaris) {
  editing.value = item
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onCancelEdit() {
  editing.value = null
}

function openDelete(item: Inventaris) {
  deleteTarget.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await store.remove(deleteTarget.value.id)
    toast.success('Barang dihapus')
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteOpen.value = false
    deleteTarget.value = null
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal menghapus barang')
  } finally {
    deleting.value = false
  }
}

async function onTogglePinjam(item: Inventaris) {
  try {
    await store.togglePinjam(item.id)
    toast.success(
      item.status_pinjam === 'tersedia' ? 'Ditandai dipinjam' : 'Ditandai tersedia',
    )
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal mengubah status pinjam')
  }
}

async function onSetKondisi(item: Inventaris, kondisi: Kondisi) {
  if (item.kondisi === kondisi) return
  try {
    await store.setKondisi(item.id, kondisi)
    toast.success('Kondisi diperbarui')
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal mengubah kondisi')
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Manajemen Inventaris</h1>
      <p class="mt-1 text-sm text-slate-500">
        Kelola aset masjid, status pinjam, dan kondisi barang.
      </p>
    </div>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">{{ editing ? 'Ubah Barang' : 'Tambah Barang' }}</h2>
        <span v-if="editing" class="badge-warning">
          Mode Edit — {{ editing.nama_barang }}
        </span>
      </div>
      <div class="p-5 md:p-6">
        <InventarisForm
          ref="formRef"
          :initial="editing"
          :loading="submitting"
          @submit="onSubmit"
          @cancel="onCancelEdit"
        />
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Daftar Inventaris</h2>
        <div class="flex flex-wrap gap-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500" for="filter-kondisi">Kondisi</label>
            <select
              id="filter-kondisi"
              v-model="store.filterKondisi"
              class="input w-auto py-2"
            >
              <option value="">Semua</option>
              <option value="baik">Baik</option>
              <option value="rusak">Rusak</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500" for="filter-status">Status pinjam</label>
            <select
              id="filter-status"
              v-model="store.filterStatus"
              class="input w-auto py-2"
            >
              <option value="">Semua</option>
              <option value="tersedia">Tersedia</option>
              <option value="dipinjam">Dipinjam</option>
            </select>
          </div>
        </div>
      </div>
      <div class="p-5 md:p-6">
        <InventarisTable
          :items="store.items"
          :loading="store.loading"
          @edit="onEdit"
          @remove="openDelete"
          @toggle-pinjam="onTogglePinjam"
          @set-kondisi="onSetKondisi"
        />
      </div>
    </section>

    <ConfirmDialog
      :open="deleteOpen"
      title="Hapus barang?"
      :message="`Barang «${deleteTarget?.nama_barang || ''}» akan dihapus dari inventaris.`"
      confirm-label="Hapus"
      danger
      :loading="deleting"
      @close="deleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
