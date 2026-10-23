# PRD — SIMAS (Sistem Informasi Manajemen Masjid)

| Field | Value |
| --- | --- |
| **Document** | Product Requirements Document |
| **Product** | SIMAS — Sistem Informasi Manajemen Masjid |
| **Version** | 1.0 |
| **Status** | Draft |
| **Source** | Diturunkan dan diperinci dari `plan.md` |
| **Last updated** | 2026-07-17 |

---

## 1. Ringkasan Eksekutif

SIMAS adalah aplikasi web untuk mengelola operasional masjid secara terpusat: agenda kegiatan takmir, transparansi arus kas keuangan, dan inventaris aset. Target pengguna utama adalah **pengurus/takmir** (yang mengelola data) dan **jamaah/publik** (yang melihat informasi transparan).

Produk dirancang sebagai monorepo web full-stack (Vue 3 + Express + SQLite) dengan tema visual **Emerald & Gold** yang bernuansa Islami modern.

### Masalah yang diselesaikan

| Masalah saat ini | Dampak | Solusi SIMAS |
| --- | --- | --- |
| Catatan kegiatan tersebar (WhatsApp, kertas, Excel) | Jamaah sulit tahu jadwal; bentrok agenda | Agenda terpusat, tampil publik & dikelola pengurus |
| Laporan kas tidak real-time / tidak transparan | Kepercayaan jamaah menurun; audit sulit | Dashboard saldo + riwayat kas masuk/keluar |
| Inventaris tidak terlacak (kondisi, pinjam, lokasi) | Barang hilang/rusak tanpa jejak | CRUD inventaris + status pinjam + kondisi |
| Akses data hanya lewat orang tertentu | Botolneck operasional | Login pengurus + halaman publik read-only |

### Tujuan produk (Goals)

1. **Transparansi keuangan** — jamaah dapat melihat ringkasan saldo dan (sesuai kebijakan) riwayat kas.
2. **Operasional takmir efisien** — pengurus dapat mengelola kegiatan, kas, dan inventaris dari satu dashboard.
3. **Keandalan data** — transaksi kas tidak dihapus sembarangan; jejak koreksi terjaga.
4. **Deploy sederhana** — SQLite + monorepo agar cocok untuk masjid skala kecil–menengah tanpa infrastruktur berat.

### Non-goals (v1)

- Aplikasi mobile native (iOS/Android).
- Multi-masjid / multi-tenant SaaS.
- Integrasi payment gateway donasi online (hanya pencatatan manual).
- Modul shalat otomatis API eksternal (banner jadwal shalat boleh placeholder/statis dulu).
- Accounting kompleks (Neraca, Jurnal Umum lengkap, multi-buku).
- Role granular lebih dari yang didefinisikan di v1 (mis. bendahara vs sekretaris terpisah — opsional lanjutan).

---

## 2. Persona & Pengguna

### 2.1 Persona

| Persona | Deskripsi | Kebutuhan utama | Frekuensi |
| --- | --- | --- | --- |
| **Jamaah / Publik** | Pengunjung website masjid, tidak login | Lihat saldo ringkas, agenda terdekat, info kegiatan | Harian–mingguan |
| **Pengurus Takmir** | Operator harian (sekretaris/admin) | CRUD kegiatan, input kas, update inventaris | Harian |
| **Bendahara** (subset pengurus) | Fokus keuangan | Input kas masuk/keluar, filter bulanan, koreksi transaksi | Harian–mingguan |
| **Ketua Takmir** (viewer advanced) | Pengawas | Melihat ringkasan, memastikan data akurat | Mingguan |

> **Catatan v1:** Role di database minimal `pengurus` (dan opsional `admin`). Pemisahan bendahara/ketua dapat digabung ke satu role `pengurus` jika sumber daya terbatas.

### 2.2 Akses

| Area | Publik (tanpa login) | Pengurus (JWT) |
| --- | --- | --- |
| Beranda (saldo ringkas + agenda) | ✅ Baca | ✅ |
| Daftar kegiatan | ✅ Baca | ✅ CRUD |
| Detail/riwayat kas penuh | ❌ atau ringkas saja | ✅ CRUD (dengan aturan soft-cancel) |
| Inventaris | ❌ (default) | ✅ CRUD |
| Login / Dashboard | ❌ | ✅ |

---

## 3. Ruang Lingkup Fitur (v1)

### 3.1 Modul A — Autentikasi & Sesi

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| AUTH-01 | Registrasi pengurus | P0 | Hanya diizinkan di environment development atau via seed/admin bootstrap; produksi: seed user awal |
| AUTH-02 | Login | P0 | Username + password → JWT |
| AUTH-03 | Logout | P0 | Hapus token di client (localStorage/session) |
| AUTH-04 | Proteksi route dashboard | P0 | Redirect ke login jika token invalid/expired |
| AUTH-05 | Middleware auth API | P0 | Endpoint mutasi dilindungi Bearer JWT |
| AUTH-06 | Role dasar | P1 | Field `role` di user (`pengurus` / `admin`) |

**Acceptance criteria (AUTH)**

- Password disimpan dengan bcrypt (cost factor wajar, mis. 10–12).
- JWT berisi minimal `sub` (user id), `username`, `role`, `exp`.
- Request tanpa token ke endpoint terproteksi → `401 Unauthorized`.
- Token expired → `401` + pesan jelas di UI.

---

### 3.2 Modul B — Kegiatan (Agenda)

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| KEG-01 | Daftar kegiatan | P0 | GET publik, urut tanggal terdekat |
| KEG-02 | Tambah kegiatan | P0 | Form: nama, tanggal, waktu, lokasi, pemateri, keterangan |
| KEG-03 | Ubah kegiatan | P0 | Edit semua field |
| KEG-04 | Hapus kegiatan | P0 | Hard delete diizinkan (bukan modul keuangan) |
| KEG-05 | Filter / filter tanggal | P1 | Filter by range atau "mendatang saja" |
| KEG-06 | Highlight khutbah Jumat / kajian | P2 | Kategori opsional di keterangan atau field tambahan |

**Data fields**

| Field | Tipe | Wajib | Validasi |
| --- | --- | --- | --- |
| `nama_kegiatan` | string | Ya | 3–200 karakter |
| `tanggal` | string `YYYY-MM-DD` | Ya | Format valid |
| `waktu` | string | Ya | Format `HH:mm` atau teks bebas terkontrol |
| `lokasi` | string | Ya | max 200 |
| `pemateri` | string | Tidak | max 150 |
| `keterangan` | string | Tidak | max 2000 |

**Acceptance criteria (KEG)**

- Publik melihat daftar kegiatan mendatang di beranda.
- Pengurus dapat CRUD dari dashboard.
- Tanggal selalu `YYYY-MM-DD` (konsisten SQLite TEXT + HTML date input).

---

### 3.3 Modul C — Kas (Keuangan)

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| KAS-01 | Catat kas masuk | P0 | Tipe `masuk`, kategori, jumlah, keterangan, tanggal, bukti opsional |
| KAS-02 | Catat kas keluar | P0 | Tipe `keluar`, validasi jumlah > 0 |
| KAS-03 | Daftar riwayat kas | P0 | Tabel + warna hijau/merah |
| KAS-04 | Filter bulanan | P0 | Filter `YYYY-MM` |
| KAS-05 | Hitung saldo total | P0 | `SUM(masuk) - SUM(keluar)` (abaikan yang dibatalkan) |
| KAS-06 | Ringkasan saldo publik | P0 | Box saldo di beranda |
| KAS-07 | Upload / path bukti nota | P1 | Path file atau URL string di `bukti_nota` |
| KAS-08 | Batalkan transaksi (soft) | P0 | **Bukan hard delete** — flag `is_cancelled` atau jurnal koreksi |
| KAS-09 | Kategori dinamis | P1 | Dropdown kategori preset (Infaq, Zakat, Operasional, dll.) |

**Aturan bisnis kritis**

1. **Jumlah tidak boleh ≤ 0.**
2. **Tidak ada hard delete bebas** pada baris kas yang sudah tercatat (transparansi).
3. Pembatalan:
   - **Opsi A (disarankan v1):** kolom `is_cancelled` + `cancelled_at` + `cancel_reason`; saldo mengabaikan baris dibatalkan.
   - **Opsi B:** buat baris koreksi berlawanan (jurnal balik) yang merujuk `related_kas_id`.
4. Saldo publik = saldo yang sama dihitung backend (single source of truth).

**Kategori preset (contoh v1)**

| Tipe | Kategori |
| --- | --- |
| Masuk | Infaq Jumat, Infaq Harian, Zakat, Donasi Khusus, Lainnya |
| Keluar | Operasional, Utilitas, Kebersihan, Kegiatan, Perawatan Aset, Lainnya |

**Acceptance criteria (KAS)**

- Setelah input kas masuk 100.000, saldo publik naik 100.000 (refresh/re-fetch).
- Filter bulan menampilkan hanya transaksi bulan tersebut.
- Endpoint DELETE permanen tidak diekspos (atau hanya admin + audit); UI tidak punya tombol "Hapus permanen".
- Transaksi dibatalkan tidak masuk perhitungan saldo, tetap terlihat di riwayat dengan badge "Dibatalkan".

---

### 3.4 Modul D — Inventaris

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| INV-01 | Daftar inventaris | P0 | Tabel lengkap |
| INV-02 | Tambah barang | P0 | Nama, jumlah, kondisi, lokasi, status pinjam |
| INV-03 | Ubah barang | P0 | Edit field |
| INV-04 | Hapus barang | P1 | Soft/hard — hard delete OK jika tidak ada riwayat pinjam kompleks |
| INV-05 | Toggle status pinjam | P0 | `tersedia` ↔ `dipinjam` (atau boolean) |
| INV-06 | Ubah kondisi | P0 | `baik` / `rusak` / (opsional `perlu_perbaikan`) |
| INV-07 | Filter kondisi / pinjam | P1 | Filter cepat di UI |

**Data fields**

| Field | Tipe | Wajib | Nilai / Validasi |
| --- | --- | --- | --- |
| `nama_barang` | string | Ya | 2–150 karakter |
| `jumlah` | integer | Ya | ≥ 1 |
| `kondisi` | enum | Ya | `baik`, `rusak` (opsional: `perlu_perbaikan`) |
| `status_pinjam` | enum/boolean | Ya | `tersedia` / `dipinjam` |
| `lokasi_penyimpanan` | string | Tidak | max 150 |

**Acceptance criteria (INV)**

- Tombol aksi cepat mengubah status pinjam tanpa buka form penuh.
- Kondisi `baik` ditampilkan hijau; `rusak` merah (selaras palet status).
- Inventaris **tidak** diekspos ke halaman publik di v1 (kecuali diputuskan sebaliknya).

---

### 3.5 Modul E — Halaman Publik (Beranda)

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| PUB-01 | Layout navbar emerald | P0 | Brand SIMAS / nama masjid, link navigasi |
| PUB-02 | Banner / running text | P1 | Jadwal shalat atau pengumuman (statis dulu OK) |
| PUB-03 | Box ringkasan saldo | P0 | Saldo total dari API |
| PUB-04 | Tabel agenda terdekat | P0 | N kegiatan mendatang (mis. 5–10) |
| PUB-05 | Responsive mobile | P0 | Layout usable di HP |

---

### 3.6 Modul F — Dashboard Pengurus

| ID | Fitur | Prioritas | Deskripsi |
| --- | --- | --- | --- |
| DASH-01 | Layout sidebar emerald-800 | P0 | Nav: Kegiatan, Kas, Inventaris, Logout |
| DASH-02 | Halaman manajemen kas | P0 | Form + tabel + filter |
| DASH-03 | Halaman manajemen inventaris | P0 | Form + tabel + aksi cepat |
| DASH-04 | Halaman manajemen kegiatan | P0 | Form + tabel |
| DASH-05 | Empty states & loading | P1 | Skeleton/spinner + pesan kosong |
| DASH-06 | Toast / notifikasi aksi | P1 | Sukses/gagal simpan |

---

## 4. User Stories

### Publik

1. Sebagai **jamaah**, saya ingin melihat **saldo kas masjid** di beranda agar saya yakin pengelolaan transparan.
2. Sebagai **jamaah**, saya ingin melihat **jadwal kegiatan terdekat** agar saya bisa hadir tepat waktu.
3. Sebagai **jamaah**, saya ingin membuka situs di **ponsel** dengan nyaman.

### Pengurus

4. Sebagai **pengurus**, saya ingin **login** agar hanya orang berwenang yang mengubah data.
5. Sebagai **pengurus**, saya ingin **menambah/mengubah/menghapus kegiatan** agar agenda selalu mutakhir.
6. Sebagai **bendahara**, saya ingin **mencatat kas masuk dan keluar** dengan kategori agar laporan rapi.
7. Sebagai **bendahara**, saya ingin **filter kas per bulan** agar laporan bulanan cepat.
8. Sebagai **bendahara**, saya ingin **membatalkan transaksi salah** tanpa menghapus jejak agar audit tetap aman.
9. Sebagai **pengurus**, saya ingin **mendata inventaris** dan menandai **dipinjam/rusak** agar aset terkontrol.

---

## 5. Alur Pengguna (Happy Paths)

### 5.1 Publik melihat transparansi

```
Buka beranda → Fetch saldo + kegiatan → Tampil box saldo + tabel agenda
```

### 5.2 Pengurus catat infaq

```
Login → Dashboard Kas → Pilih tipe Masuk → Isi form → Submit
→ API create → Refresh daftar + saldo → Toast sukses
```

### 5.3 Koreksi transaksi salah

```
Dashboard Kas → Pilih transaksi → Batalkan + isi alasan
→ is_cancelled=true → Saldo dihitung ulang → Riwayat tetap terlihat (badge)
```

### 5.4 Pinjam sound system

```
Dashboard Inventaris → Cari barang → Toggle "Dipinjam"
→ status_pinjam update → Badge berubah di tabel
```

---

## 6. Persyaratan Non-Fungsional (NFR)

| ID | Kategori | Persyaratan |
| --- | --- | --- |
| NFR-01 | Performa | Halaman publik < 2s pada jaringan lokal/moderat; query saldo O(1) atau agregasi ringan |
| NFR-02 | Keamanan | Password hash bcrypt; JWT secret di env; CORS terkonfigurasi; validasi input server-side |
| NFR-03 | Ketersediaan | Single instance OK v1; backup file `database.sqlite` didokumentasikan |
| NFR-04 | Usability | UI bahasa Indonesia; kontras warna memadai; form error jelas |
| NFR-05 | Maintainability | TypeScript strict; monorepo `frontend/` + `backend/`; struktur router/controller jelas |
| NFR-06 | Kompatibilitas | Browser modern (Chrome, Firefox, Edge, Safari terbaru) |
| NFR-07 | Data integrity | Format tanggal `YYYY-MM-DD`; jumlah kas integer/decimal positif konsisten |
| NFR-08 | Transparansi | Tidak ada hard delete bebas pada kas |

---

## 7. Desain Visual (Product Requirements)

Palet mengikuti prinsip 60-30-10:

| Peran | Token Tailwind | Hex | Penggunaan UI |
| --- | --- | --- | --- |
| Primary (30%) | `emerald-700` / `emerald-800` | `#047857` / `#065f46` | Navbar, sidebar, header tabel, tombol utama |
| Secondary (60%) | `slate-50` / `white` | `#f8fafc` / `#ffffff` | Background halaman, kartu, area konten |
| Accent (10%) | `amber-500` / `amber-600` | `#f59e0b` / `#d97706` | CTA donasi/cetak, ikon sorotan, badge aktif, aksen border |
| Status masuk / baik | `green-600` | `#16a34a` | Kas masuk, kondisi baik |
| Status keluar / rusak | `red-600` | `#dc2626` | Kas keluar, kondisi rusak |

**Prinsip UX**

- Bahasa UI: **Indonesia**.
- Feedback visual pada setiap mutasi data.
- Tabel kas: jumlah masuk hijau, keluar merah.
- Dashboard admin: sidebar tetap (desktop), collapsible (mobile — P1).

---

## 8. Metrik Keberhasilan (Success Metrics)

| Metrik | Target v1 (internal / demo) |
| --- | --- |
| CRUD kegiatan berfungsi E2E | 100% flow lulus manual test |
| CRUD kas + saldo konsisten | Selisih saldo UI vs query SQL = 0 |
| Soft-cancel kas | Transaksi dibatalkan tidak memengaruhi saldo |
| Login protected routes | Dashboard tidak accessible tanpa token |
| Halaman publik readable mobile | Layout tidak horizontal-overflow di 375px |
| Setup dev baru | < 30 menit dari clone → running (README) |

---

## 9. Asumsi & Ketergantungan

### Asumsi

- Satu masjid per instalasi (single-tenant).
- Pengurus cukup melek komputer dasar (form web).
- Volume data kecil–menengah (ribuan baris, bukan jutaan) — SQLite memadai.
- Hosting bisa VPS kecil atau lokal PC masjid.
- Nama masjid / branding dikonfigurasi via env atau konstanta frontend.

### Ketergantungan teknis

- Node.js LTS, npm.
- Browser modern.
- (Opsional) reverse proxy (Nginx) untuk produksi.

### Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| SQLite file corrupt / hilang | Data hilang | Backup berkala file DB; dokumentasi restore |
| JWT secret bocor | Account takeover | Env only; rotasi secret |
| Hard delete kas oleh dev | Hilang jejak audit | Tidak expose endpoint; code review + PRD rule |
| Upload bukti tanpa validasi | Storage/security issue | v1: path string; v2: validasi mime/size |
| Registrasi terbuka di prod | User liar | Disable public register; seed admin |

---

## 10. Roadmap Produk

### Fase 1 — MVP (sesuai plan 5 hari)

1. Monorepo + auth JWT  
2. API CRUD kegiatan, kas, inventaris  
3. Beranda publik + dashboard pengurus  
4. Soft-cancel kas + validasi edge cases  

### Fase 2 — Peningkatan (post-MVP)

- Export laporan kas PDF/Excel  
- Upload bukti nota ke storage lokal terkontrol  
- Kategori custom di DB  
- Riwayat peminjaman inventaris  
- Role bendahara vs admin  
- Banner jadwal shalat dari API  

### Fase 3 — Skala

- Migrasi PostgreSQL jika multi-user concurrent tinggi  
- Multi-masjid  
- Donasi online  

---

## 11. Out of Scope Detail (penegasan)

- Chat/bot WhatsApp otomatis  
- Sistem absensi jamaah  
- Modul qurban/zakat fitrah terpisah penuh  
- Offline-first PWA (boleh dievaluasi nanti)  
- Multi-bahasa  

---

## 12. Acceptance Checklist Rilis MVP

- [ ] User seed/admin bisa login  
- [ ] Publik melihat saldo & agenda tanpa login  
- [ ] Pengurus CRUD kegiatan  
- [ ] Pengurus input kas masuk/keluar; saldo update  
- [ ] Filter kas bulanan  
- [ ] Batalkan transaksi kas (soft); saldo benar  
- [ ] CRUD inventaris + toggle pinjam + kondisi  
- [ ] Route dashboard terproteksi  
- [ ] TypeScript strict lolos compile frontend & backend  
- [ ] CORS dev frontend→backend OK  
- [ ] Tanggal konsisten `YYYY-MM-DD`  
- [ ] UI mengikuti palet emerald/amber  

---

## 13. Open Questions (Produk)

| # | Pertanyaan | Opsi default usulan |
| --- | --- | --- |
| Q1 | Apakah riwayat kas detail boleh dilihat publik? | Hanya **saldo total** di publik; detail di dashboard |
| Q2 | Soft-cancel vs jurnal balik? | **Soft-cancel (`is_cancelled`)** untuk v1 |
| Q3 | Registrasi publik pengurus? | **Tidak** di produksi; seed + optional create-by-admin |
| Q4 | Bukti nota: file upload atau teks path? | **Teks/path** dulu; upload file di fase 2 |
| Q5 | Nama masjid configurable? | Konstanta env `VITE_MASJID_NAME` |

---

## 14. Referensi

- Dokumen sumber: `plan.md`
- Dokumen teknis: `DESIGN.md`
