/** Format angka ke Rupiah, contoh: Rp 1.500.000 */
export function formatRupiah(angka: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka || 0)
}

/** Format tanggal YYYY-MM-DD ke "17 Juli 2026" */
export function formatTanggalID(isoDate: string): string {
  if (!isoDate) return '-'
  // Parse as local date to avoid timezone shift on YYYY-MM-DD
  const parts = isoDate.slice(0, 10).split('-')
  if (parts.length !== 3) return isoDate
  const [y, m, d] = parts.map(Number)
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return isoDate
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Format timestamp ISO/SQLite ke tampilan singkat */
export function formatDateTimeID(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value.includes('T') ? value : value.replace(' ', 'T') + 'Z')
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/** Bulan sekarang dalam format YYYY-MM */
export function currentMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Tanggal hari ini YYYY-MM-DD */
export function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function labelKondisi(kondisi: string): string {
  switch (kondisi) {
    case 'baik':
      return 'Baik'
    case 'rusak':
      return 'Rusak'
    case 'perlu_perbaikan':
      return 'Perlu Perbaikan'
    default:
      return kondisi
  }
}

export function labelStatusPinjam(status: string): string {
  return status === 'dipinjam' ? 'Dipinjam' : 'Tersedia'
}
