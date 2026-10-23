# 🕌 Rencana Pengembangan SIMAS (Sistem Informasi Manajemen Masjid)

Dokumen ini berisi cetak biru komprehensif untuk pembangunan aplikasi manajemen masjid berbasis web. Sistem ini dirancang khusus untuk mengelola kegiatan takmir, transparansi kas keuangan, dan pelacakan inventaris aset secara *real-time*.

---

## 🎨 Spesifikasi Palet Warna (Emerald & Gold)
Sesuai preferensi, tema warna yang dipilih menggabungkan nuansa Islami tradisional yang sejuk dengan aksen modern yang elegan menggunakan **Tailwind CSS**.

*   **Primary / Dominan (30%):** `emerald-700` (`#047857`) & `emerald-800` (`#065f46`)
    *   *Penggunaan:* Navbar, Sidebar Dashboard, Header Tabel, dan Tombol Utama.
*   **Secondary / Latar Belakang (60%):** `slate-50` (`#f8fafc`) & `white` (`#ffffff`)
    *   *Penggunaan:* Latar belakang halaman, kartu informasi, dan area membaca konten.
*   **Accent / Sorotan (10%):** `amber-500` (`#f59e0b`) & `amber-600` (`#d97706`)
    *   *Penggunaan:* Tombol penting (Donasi/Cetak), ikon sorotan, lencana status aktif, dan aksen garis pembatas.
*   **Status Khas:**
    *   `green-600` (`#16a34a`) untuk Kas Masuk / Kondisi Barang Baik.
    *   `red-600` (`#dc2626`) untuk Kas Keluar / Kondisi Barang Rusak.

---

## 🛠️ Stack Teknologi & Arsitektur

### 1. Frontend Component
*   **Framework:** Vue 3 (Composition API / `<script setup>`)
*   **Build Tool & Bundler:** Vite
*   **Styling Engine:** Tailwind CSS
*   **State Management:** Pinia (Untuk pengelolaan state global yang modular)
*   **Bahasa:** TypeScript (`strict: true`)

### 2. Backend Component
*   **Runtime:** Node.js
*   **Framework:** Express.js dengan TypeScript (`ts-node-dev` untuk development)
*   **Database Driver:** `sqlite3` atau `better-sqlite3` (Menggunakan Raw SQL Queries untuk efisiensi dan kontrol penuh)

### 3. Struktur Relasi Database (SQLite)
*   **Tabel `users`:** Autentikasi pengurus (`id`, `username`, `password`, `role`).
*   **Tabel `kegiatan`:** Manajemen agenda (`id`, `nama_kegiatan`, `tanggal`, `waktu`, `lokasi`, `pemateri`, `keterangan`).
*   **Tabel `kas`:** Akuntansi masjid (`id`, `tipe`, `kategori`, `jumlah`, `keterangan`, `tanggal`, `bukti_nota`).
*   **Tabel `inventaris`:** Pendataan barang (`id`, `nama_barang`, `jumlah`, `kondisi`, `status_pinjam`, `lokasi_penyimpanan`).

---

## 🚀 Tahapan Eksekusi Pengembang (Roadmap)

### HARI 1: Inisialisasi Proyek & Setup Lingkungan Kerja
1.  Membuat arsitektur monorepo dengan memisahkan folder `frontend` dan `backend`.
2.  **Backend Setup:**
    *   Inisialisasi `npm init -y`, pasang `typescript`, `@types/node`, `express`, `cors`, `dotenv`.
    *   Konfigurasi `tsconfig.json` dan skrip koneksi database SQLite (`database.sqlite`).
3.  **Frontend Setup:**
    *   Scaffolding proyek menggunakan `npm create vite@latest frontend -- --template vue-ts`.
    *   Instalasi dan konfigurasi Tailwind CSS (`tailwind.config.js` memasukkan palet warna `emerald` dan `amber`).
    *   Instalasi Pinia dan Vue Router.

### HARI 2: Pembangunan Backend API & Skema Database
1.  Menulis script migrasi database untuk membuat tabel `users`, `kegiatan`, `kas`, dan `inventaris`.
2.  Implementasi registrasi dan login pengurus menggunakan enkripsi `bcrypt` dan token `jsonwebtoken` (JWT).
3.  Membuat Express Routers & Controllers untuk:
    *   **CRUD Kegiatan:** GET (publik), POST/PUT/DELETE (proteksi auth pengurus).
    *   **CRUD Kas:** Pencatatan arus kas terintegrasi kalkulasi saldo total otomatis.
    *   **CRUD Inventaris:** Pencatatan aset dan mekanisme *toggle* status peminjaman.

### HARI 3: Pengembangan Frontend - Halaman Publik & Store State
1.  Membuat tata letak (*Layout*) dasar halaman publik dengan Navbar atas berwarna `emerald-700` dan teks aksen `amber-500`.
2.  Implementasi Pinia Store (`useKasStore`, `useKegiatanStore`) untuk berinteraksi dengan API Express menggunakan `fetch` atau `axios`.
3.  Membangun Halaman Beranda Publik:
    *   Komponen *Running Text* / banner jadwal shalat.
    *   Ringkasan Saldo Kas Masjid (Visualisasi Box Kontainer).
    *   Tabel Agenda Kegiatan terdekat.

### HARI 4: Pengembangan Frontend - Dashboard Pengurus & Formulir
1.  Membuat tata letak Dashboard Admin (Sidebar navigasi vertikal warna `emerald-800`).
2.  Membangun Halaman Manajemen Kas:
    *   Formulir tambah kas masuk/keluar dengan pilihan kategori dinamis.
    *   Tabel riwayat keuangan lengkap dengan filter bulanan dan pewarnaan teks dinamis (`text-green-600` / `text-red-600`).
3.  Membangun Halaman Manajemen Inventaris:
    *   Tabel inventaris beserta tombol aksi cepat untuk mengubah status kondisi barang atau mencatat status pinjam.
4.  Membangun Halaman Manajemen Kegiatan:
    *   Form input penjadwalan khutbah jumat dan kajian rutin.

### HARI 5: Pengujian, Validasi data, & Integrasi Akhir
1.  Pengujian CORS dan validasi tipe data TypeScript ujung-ke-ujung (*End-to-End Type Safety*).
2.  Penanganan kasus *edge cases*: Validasi input kas tidak boleh minus, penanganan string tanggal SQLite agar konsisten (`YYYY-MM-DD`).
3.  Optimasi performa query database dan pembersihan berkas development.

---

## 📝 Catatan Penting untuk Pengembangan
*   **Format Tanggal:** Karena SQLite menyimpan tanggal sebagai teks, pastikan di frontend menggunakan input tipe HTML5 `<input type="date">` yang secara otomatis menghasilkan format string `YYYY-MM-DD`.
*   **Keamanan Transaksi:** Modul Kas tidak boleh memiliki fitur hapus permanen (`hard delete`) secara bebas demi menjaga transparansi. Disarankan menggunakan sistem pembatalan transaksi dengan membuat baris data baru koreksi (jurnal balik) atau penambahan kolom status `is_cancelled`.