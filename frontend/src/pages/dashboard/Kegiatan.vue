<script setup lang="ts">
import { onMounted, ref } from 'vue'
import KegiatanForm from '../../components/kegiatan/KegiatanForm.vue'
import KegiatanTable from '../../components/kegiatan/KegiatanTable.vue'
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue'
import { useKegiatanStore } from '../../stores/kegiatan'
import { useToastStore } from '../../stores/toast'
import type { Kegiatan, KegiatanInput } from '../../types'
import { AppError } from '../../services/api'

const store = useKegiatanStore()
const toast = useToastStore()

const formRef = ref<InstanceType<typeof KegiatanForm> | null>(null)
const editing = ref<Kegiatan | null>(null)
const submitting = ref(false)
const deleting = ref(false)
const deleteOpen = ref(false)
const deleteTarget = ref<Kegiatan | null>(null)

async function load() {
  try {
    await store.fetchAll()
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal memuat kegiatan')
  }
}

onMounted(load)

async function onSubmit(payload: KegiatanInput) {
  submitting.value = true
  try {
    if (editing.value) {
      await store.update(editing.value.id, payload)
      toast.success('Kegiatan diperbarui')
      editing.value = null
    } else {
      await store.create(payload)
      toast.success('Kegiatan ditambahkan')
      formRef.value?.reset()
    }
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal menyimpan kegiatan')
  } finally {
    submitting.value = false
  }
}

function onEdit(item: Kegiatan) {
  editing.value = item
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onCancelEdit() {
  editing.value = null
}

function openDelete(item: Kegiatan) {
  deleteTarget.value = item
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await store.remove(deleteTarget.value.id)
    toast.success('Kegiatan dihapus')
    if (editing.value?.id === deleteTarget.value.id) editing.value = null
    deleteOpen.value = false
    deleteTarget.value = null
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal menghapus kegiatan')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Manajemen Kegiatan</h1>
      <p class="mt-1 text-sm text-slate-500">Tambah, ubah, atau hapus agenda kegiatan masjid.</p>
    </div>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">{{ editing ? 'Ubah Kegiatan' : 'Tambah Kegiatan' }}</h2>
        <span
          v-if="editing"
          class="badge-warning"
        >
          Mode Edit — {{ editing.nama_kegiatan }}
        </span>
      </div>
      <div class="p-5 md:p-6">
        <KegiatanForm
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
        <h2 class="card-title">Daftar Kegiatan</h2>
        <span class="text-sm text-slate-400">{{ store.items.length }} kegiatan</span>
      </div>
      <div class="p-5 md:p-6">
        <KegiatanTable
          :items="store.items"
          :loading="store.loading"
          variant="admin"
          @edit="onEdit"
          @remove="openDelete"
        />
      </div>
    </section>

    <ConfirmDialog
      :open="deleteOpen"
      title="Hapus kegiatan?"
      :message="`Kegiatan «${deleteTarget?.nama_kegiatan || ''}» akan dihapus permanen.`"
      confirm-label="Hapus"
      danger
      :loading="deleting"
      @close="deleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>
