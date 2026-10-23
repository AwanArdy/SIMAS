<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import KasForm from '../../components/kas/KasForm.vue'
import KasTable from '../../components/kas/KasTable.vue'
import MonthFilter from '../../components/kas/MonthFilter.vue'
import SaldoCard from '../../components/kas/SaldoCard.vue'
import ConfirmDialog from '../../components/ui/ConfirmDialog.vue'
import { useKasStore } from '../../stores/kas'
import { useToastStore } from '../../stores/toast'
import type { Kas, KasInput } from '../../types'
import { AppError } from '../../services/api'

const kas = useKasStore()
const toast = useToastStore()

const formRef = ref<InstanceType<typeof KasForm> | null>(null)
const submitting = ref(false)
const cancelling = ref(false)

const cancelOpen = ref(false)
const cancelTarget = ref<Kas | null>(null)

async function load() {
  try {
    await Promise.all([kas.fetchList(), kas.fetchSaldo()])
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal memuat data kas')
  }
}

onMounted(load)

watch(
  () => kas.filterMonth,
  () => {
    load()
  },
)

async function onCreate(payload: KasInput) {
  submitting.value = true
  try {
    await kas.create(payload)
    toast.success('Transaksi kas berhasil disimpan')
    formRef.value?.reset()
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal menyimpan transaksi')
  } finally {
    submitting.value = false
  }
}

function openCancel(item: Kas) {
  cancelTarget.value = item
  cancelOpen.value = true
}

async function confirmCancel(reason: string) {
  if (!cancelTarget.value) return
  cancelling.value = true
  try {
    await kas.cancel(cancelTarget.value.id, reason)
    toast.success('Transaksi dibatalkan')
    cancelOpen.value = false
    cancelTarget.value = null
  } catch (err: unknown) {
    toast.error(err instanceof AppError ? err.message : 'Gagal membatalkan transaksi')
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Manajemen Kas</h1>
      <p class="mt-1 text-sm text-slate-500">
        Catat pemasukan &amp; pengeluaran. Pembatalan bersifat soft-cancel (jejak tetap tersimpan).
      </p>
    </div>

    <SaldoCard
      :data="kas.saldo"
      :loading="kas.loadingSaldo"
      :error="kas.error"
      compact
    />

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Catat Transaksi Baru</h2>
      </div>
      <div class="p-5 md:p-6">
        <KasForm ref="formRef" :loading="submitting" @submit="onCreate" />
      </div>
    </section>

    <section class="card">
      <div class="card-header">
        <h2 class="card-title">Riwayat Kas</h2>
        <MonthFilter v-model="kas.filterMonth" />
      </div>
      <div class="p-5 md:p-6">
        <KasTable :items="kas.items" :loading="kas.loading" @cancel="openCancel" />
      </div>
    </section>

    <ConfirmDialog
      :open="cancelOpen"
      title="Batalkan transaksi?"
      message="Transaksi tidak dihapus permanen. Saldo akan dihitung ulang dan baris tetap terlihat dengan badge Dibatalkan."
      confirm-label="Batalkan Transaksi"
      danger
      require-reason
      reason-label="Alasan pembatalan"
      reason-placeholder="Contoh: Salah input nominal"
      :loading="cancelling"
      @close="cancelOpen = false"
      @confirm="confirmCancel"
    />
  </div>
</template>
