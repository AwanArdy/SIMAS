export type UserRole = 'pengurus' | 'admin'

export interface User {
  id: number
  username: string
  role: UserRole
}

export interface LoginResponse {
  token: string
  user: User
}

export interface MeResponse {
  user: User
}

export interface Kegiatan {
  id: number
  nama_kegiatan: string
  tanggal: string
  waktu: string
  lokasi: string
  pemateri: string | null
  keterangan: string | null
  created_at?: string
  updated_at?: string
}

export interface KegiatanInput {
  nama_kegiatan: string
  tanggal: string
  waktu: string
  lokasi: string
  pemateri?: string | null
  keterangan?: string | null
}

export type KasTipe = 'masuk' | 'keluar'

export interface Kas {
  id: number
  tipe: KasTipe
  kategori: string
  jumlah: number
  keterangan: string | null
  tanggal: string
  bukti_nota: string | null
  is_cancelled: number
  cancelled_at: string | null
  cancel_reason: string | null
  created_by: number | null
  created_at?: string
  updated_at?: string
}

export interface KasInput {
  tipe: KasTipe
  kategori: string
  jumlah: number
  keterangan?: string | null
  tanggal: string
  bukti_nota?: string | null
}

export interface SaldoResponse {
  saldo: number
  total_masuk: number
  total_keluar: number
  as_of: string
}

export type Kondisi = 'baik' | 'rusak' | 'perlu_perbaikan'
export type StatusPinjam = 'tersedia' | 'dipinjam'

export interface Inventaris {
  id: number
  nama_barang: string
  jumlah: number
  kondisi: Kondisi
  status_pinjam: StatusPinjam
  lokasi_penyimpanan: string | null
  created_at?: string
  updated_at?: string
}

export interface InventarisInput {
  nama_barang: string
  jumlah: number
  kondisi: Kondisi
  status_pinjam: StatusPinjam
  lokasi_penyimpanan?: string | null
}

export const KATEGORI_MASUK = [
  'Infaq Jumat',
  'Infaq Harian',
  'Zakat',
  'Donasi Khusus',
  'Lainnya',
] as const

export const KATEGORI_KELUAR = [
  'Operasional',
  'Utilitas',
  'Kebersihan',
  'Kegiatan',
  'Perawatan Aset',
  'Lainnya',
] as const
