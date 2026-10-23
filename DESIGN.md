# DESIGN — SIMAS (Sistem Informasi Manajemen Masjid)

| Field | Value |
| --- | --- |
| **Document** | Technical Design Document |
| **Product** | SIMAS — Sistem Informasi Manajemen Masjid |
| **Version** | 1.0 |
| **Status** | Draft |
| **Source** | Diturunkan dan diperinci dari `plan.md` + `PRD.md` |
| **Last updated** | 2026-07-17 |

---

## 1. Overview

Dokumen ini mendefinisikan arsitektur, skema data, kontrak API, struktur frontend/backend, keamanan, dan rencana implementasi untuk SIMAS. Target pembaca: engineer yang akan mengimplementasikan MVP tanpa ambiguitas besar.

### 1.1 Ringkasan sistem

```
┌─────────────────────┐         HTTPS / HTTP (dev)        ┌──────────────────────┐
│  Vue 3 + Vite       │  ───────────────────────────────► │  Express (Node.js)   │
│  Pinia + Vue Router │  ◄─────────────────────────────── │  JWT Auth Middleware │
│  Tailwind CSS       │         JSON REST API             │  Controllers/Routers │
└─────────────────────┘                                   │         │            │
                                                          │         ▼            │
                                                          │  better-sqlite3      │
                                                          │  database.sqlite     │
                                                          └──────────────────────┘
```

### 1.2 Prinsip desain

1. **Simple deploy** — satu proses backend + static frontend; SQLite file-based.
2. **Type safety** — TypeScript `strict` di frontend dan backend.
3. **Transparansi kas** — tidak ada hard delete bebas; soft-cancel.
4. **Single source of truth** — saldo dihitung di backend, bukan di client saja.
5. **Separation of concerns** — monorepo `frontend/` + `backend/`, API REST jelas.

---

## 2. Key Decisions

| # | Keputusan | Pilihan | Rationale | Alternatif ditolak |
| --- | --- | --- | --- | --- |
| KD-01 | Monorepo layout | `frontend/` + `backend/` terpisah package | Setup 5-hari; deploy fleksibel; skillset jelas | Nx/Turborepo (overhead untuk MVP) |
| KD-02 | Frontend | Vue 3 Composition API + Vite + TS | Cepat, modern, sesuai plan | React/Svelte (bukan preferensi plan) |
| KD-03 | State | Pinia stores per domain | Modular, devtools baik | Hanya composable tanpa store (sulit cache global) |
| KD-04 | Backend | Express + TypeScript | Minimal, familiar, cepat | NestJS (boilerplate lebih berat) |
| KD-05 | DB | SQLite via `better-sqlite3` | Sync API cepat, zero-config, cocok skala masjid | PostgreSQL (ops-heavy untuk v1); `sqlite3` async callback (lebih verbose) |
| KD-06 | Query style | Raw SQL | Kontrol penuh, transparan, tanpa ORM lock-in | Prisma/Drizzle (boleh fase 2) |
| KD-07 | Auth | JWT (Bearer) + bcrypt | Stateless, cocok SPA | Session cookie server (perlu sticky session; OK alternatif) |
| KD-08 | Kas delete policy | Soft-cancel `is_cancelled` | Implementasi sederhana + jejak audit | Jurnal balik only (lebih "akuntansi murni", lebih kompleks UI) |
| KD-09 | Uang (jumlah) | INTEGER (rupiah utuh) | Hindari float; IDR tanpa sen | REAL/float (error pembulatan) |
| KD-10 | Tanggal | TEXT `YYYY-MM-DD` | Konsisten HTML date + SQLite | INTEGER unix (kurang ergonomis form) |
| KD-11 | API style | REST JSON | Sederhana untuk CRUD | GraphQL (overkill) |
| KD-12 | Public kas detail | Hanya saldo agregat | Privasi + cukup transparansi v1 | Full ledger publik (kebijakan masjid bisa ubah nanti) |
| KD-13 | Register | Seed/bootstrap, bukan open register prod | Keamanan | Open self-register |
| KD-14 | Theme | Tailwind emerald + amber | Sesuai brand Islami modern plan | CSS custom tanpa utility |

---

## 3. Arsitektur Repository

```
SIMAS/
├── plan.md
├── PRD.md
├── DESIGN.md
├── README.md                 # setup instructions
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   ├── kas/
│       │   ├── kegiatan/
│       │   └── inventaris/
│       ├── layouts/
│       │   ├── PublicLayout.vue
│       │   └── DashboardLayout.vue
│       ├── pages/            # atau views/
│       │   ├── public/
│       │   └── dashboard/
│       ├── router/
│       │   └── index.ts
│       ├── stores/
│       │   ├── auth.ts
│       │   ├── kas.ts
│       │   ├── kegiatan.ts
│       │   └── inventaris.ts
│       ├── services/         # API client
│       │   └── api.ts
│       ├── types/
│       └── utils/
│           └── format.ts
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── src/
    │   ├── index.ts          # entry, listen port
    │   ├── app.ts            # express app setup
    │   ├── config/
    │   │   └── env.ts
    │   ├── db/
    │   │   ├── connection.ts
    │   │   ├── migrate.ts
    │   │   └── seed.ts
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   ├── errorHandler.ts
    │   │   └── validate.ts
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   ├── kegiatan.routes.ts
    │   │   ├── kas.routes.ts
    │   │   └── inventaris.routes.ts
    │   ├── controllers/
    │   ├── services/         # business logic opsional
    │   └── types/
    └── data/
        └── database.sqlite   # gitignored
```

### 3.1 Scripts yang diharapkan

**Backend**

```json
{
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "db:migrate": "ts-node src/db/migrate.ts",
  "db:seed": "ts-node src/db/seed.ts"
}
```

**Frontend**

```json
{
  "dev": "vite",
  "build": "vue-tsc -b && vite build",
  "preview": "vite preview"
}
```

### 3.2 Environment variables

**Backend `.env`**

| Variable | Contoh | Wajib | Keterangan |
| --- | --- | --- | --- |
| `PORT` | `3000` | Ya | Port API |
| `DATABASE_PATH` | `./data/database.sqlite` | Ya | Path file SQLite |
| `JWT_SECRET` | long random string | Ya | Signing key |
| `JWT_EXPIRES_IN` | `1d` | Tidak | Default 1 hari |
| `CORS_ORIGIN` | `http://localhost:5173` | Ya | Origin Vite |
| `NODE_ENV` | `development` | Ya | Mode |
| `SEED_ADMIN_USER` | `admin` | Dev | Untuk seed |
| `SEED_ADMIN_PASS` | `admin123` | Dev | Untuk seed |

**Frontend `.env`**

| Variable | Contoh | Keterangan |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Base URL API |
| `VITE_MASJID_NAME` | `Masjid Al-Ikhlas` | Branding UI |

---

## 4. Skema Database

### 4.1 ERD (logis)

```
users 1───* (audit opsional, tidak wajib v1)

kegiatan     — independen
kas          — independen (+ self-ref opsional related_kas_id)
inventaris   — independen
```

Tidak ada FK antar modul domain di v1 (kecuali self-ref kas jika jurnal balik ditambahkan nanti).

### 4.2 Tabel `users`

```sql
CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password   TEXT NOT NULL,          -- bcrypt hash
  role       TEXT NOT NULL DEFAULT 'pengurus'
             CHECK (role IN ('pengurus', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 4.3 Tabel `kegiatan`

```sql
CREATE TABLE IF NOT EXISTS kegiatan (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_kegiatan  TEXT NOT NULL,
  tanggal        TEXT NOT NULL,       -- YYYY-MM-DD
  waktu          TEXT NOT NULL,       -- HH:mm atau deskripsi
  lokasi         TEXT NOT NULL,
  pemateri       TEXT,
  keterangan     TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal ON kegiatan (tanggal);
```

### 4.4 Tabel `kas`

```sql
CREATE TABLE IF NOT EXISTS kas (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  tipe            TEXT NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
  kategori        TEXT NOT NULL,
  jumlah          INTEGER NOT NULL CHECK (jumlah > 0),  -- rupiah
  keterangan      TEXT,
  tanggal         TEXT NOT NULL,      -- YYYY-MM-DD
  bukti_nota      TEXT,               -- path/URL opsional
  is_cancelled    INTEGER NOT NULL DEFAULT 0
                  CHECK (is_cancelled IN (0, 1)),
  cancelled_at    TEXT,
  cancel_reason   TEXT,
  created_by      INTEGER REFERENCES users(id),
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kas_tanggal ON kas (tanggal);
CREATE INDEX IF NOT EXISTS idx_kas_tipe ON kas (tipe);
CREATE INDEX IF NOT EXISTS idx_kas_cancelled ON kas (is_cancelled);
```

**Saldo (query kanonik):**

```sql
SELECT
  COALESCE(SUM(CASE WHEN tipe = 'masuk'  AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0)
  -
  COALESCE(SUM(CASE WHEN tipe = 'keluar' AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0)
  AS saldo
FROM kas;
```

**Filter bulan:**

```sql
WHERE tanggal LIKE '2026-07%' AND is_cancelled = 0  -- opsional tampilkan cancelled juga di UI
```

> UI riwayat: tampilkan **termasuk** yang dibatalkan (dengan badge). Perhitungan saldo selalu `is_cancelled = 0`.

### 4.5 Tabel `inventaris`

```sql
CREATE TABLE IF NOT EXISTS inventaris (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_barang         TEXT NOT NULL,
  jumlah              INTEGER NOT NULL CHECK (jumlah >= 1),
  kondisi             TEXT NOT NULL DEFAULT 'baik'
                      CHECK (kondisi IN ('baik', 'rusak', 'perlu_perbaikan')),
  status_pinjam       TEXT NOT NULL DEFAULT 'tersedia'
                      CHECK (status_pinjam IN ('tersedia', 'dipinjam')),
  lokasi_penyimpanan  TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 4.6 Migrasi

- File `backend/src/db/migrate.ts` menjalankan `CREATE TABLE IF NOT EXISTS` + indexes secara idempotent.
- Dipanggil otomatis saat startup app **atau** via script `npm run db:migrate`.
- Seed (`db:seed.ts`): buat 1 admin jika belum ada; opsional sample kegiatan/kas untuk demo.

### 4.7 Evolusi skema ke depan

| Perubahan | Kapan |
| --- | --- |
| `kategori` table terpisah | Fase 2 |
| `kas_attachments` file metadata | Fase 2 |
| `peminjaman` history table | Fase 2 |
| `related_kas_id` untuk jurnal balik | Jika soft-cancel tidak cukup |

---

## 5. API Design

Base path: `/api`  
Content-Type: `application/json`  
Auth header: `Authorization: Bearer <token>`

### 5.1 Konvensi response

**Sukses**

```json
{
  "success": true,
  "data": { }
}
```

**Sukses list**

```json
{
  "success": true,
  "data": [ ],
  "meta": { "total": 10 }
}
```

**Error**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Jumlah harus lebih dari 0",
    "details": []
  }
}
```

**HTTP status**

| Status | Penggunaan |
| --- | --- |
| 200 | OK |
| 201 | Created |
| 400 | Validasi / business rule |
| 401 | Unauthenticated |
| 403 | Forbidden (role) |
| 404 | Not found |
| 409 | Conflict (username duplikat) |
| 500 | Server error |

### 5.2 Auth endpoints

| Method | Path | Auth | Deskripsi |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Login → JWT |
| POST | `/api/auth/register` | No* | Hanya jika `NODE_ENV=development` atau dimatikan |
| GET | `/api/auth/me` | Yes | Profil user dari token |

**POST `/api/auth/login`**

Request:

```json
{ "username": "admin", "password": "secret" }
```

Response `200`:

```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": { "id": 1, "username": "admin", "role": "admin" }
  }
}
```

### 5.3 Kegiatan endpoints

| Method | Path | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/kegiatan` | No | List; query `?upcoming=true&limit=10` |
| GET | `/api/kegiatan/:id` | No | Detail |
| POST | `/api/kegiatan` | Yes | Create |
| PUT | `/api/kegiatan/:id` | Yes | Update |
| DELETE | `/api/kegiatan/:id` | Yes | Hard delete |

**Body create/update**

```json
{
  "nama_kegiatan": "Kajian Rutin Ahad",
  "tanggal": "2026-07-20",
  "waktu": "08:00",
  "lokasi": "Aula Masjid",
  "pemateri": "Ustadz Ahmad",
  "keterangan": "Tema: Adab Menuntut Ilmu"
}
```

### 5.4 Kas endpoints

| Method | Path | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/kas/saldo` | No | Saldo publik |
| GET | `/api/kas` | Yes | List + filter `?month=2026-07&include_cancelled=true` |
| GET | `/api/kas/:id` | Yes | Detail |
| POST | `/api/kas` | Yes | Create transaksi |
| PATCH | `/api/kas/:id/cancel` | Yes | Soft-cancel |
| ~~DELETE~~ | `/api/kas/:id` | — | **Tidak diekspos di v1** |

**POST `/api/kas`**

```json
{
  "tipe": "masuk",
  "kategori": "Infaq Jumat",
  "jumlah": 1500000,
  "keterangan": "Infaq jumat minggu ke-3",
  "tanggal": "2026-07-17",
  "bukti_nota": null
}
```

Validasi server:

- `tipe` ∈ {`masuk`,`keluar`}
- `jumlah` integer > 0
- `tanggal` match `/^\d{4}-\d{2}-\d{2}$/`
- `kategori` non-empty string

**PATCH `/api/kas/:id/cancel`**

```json
{ "cancel_reason": "Salah input nominal" }
```

Rules:

- Jika sudah `is_cancelled=1` → `400`
- Set `is_cancelled=1`, `cancelled_at=datetime('now')`, simpan reason

**GET `/api/kas/saldo`**

```json
{
  "success": true,
  "data": {
    "saldo": 12500000,
    "total_masuk": 20000000,
    "total_keluar": 7500000,
    "as_of": "2026-07-17T10:00:00.000Z"
  }
}
```

### 5.5 Inventaris endpoints

| Method | Path | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/inventaris` | Yes | List; query filter kondisi/status |
| GET | `/api/inventaris/:id` | Yes | Detail |
| POST | `/api/inventaris` | Yes | Create |
| PUT | `/api/inventaris/:id` | Yes | Update full |
| PATCH | `/api/inventaris/:id/toggle-pinjam` | Yes | Toggle status pinjam |
| PATCH | `/api/inventaris/:id/kondisi` | Yes | Set kondisi |
| DELETE | `/api/inventaris/:id` | Yes | Hard delete (P1) |

**PATCH toggle pinjam** — body kosong; server flip:

- `tersedia` → `dipinjam`
- `dipinjam` → `tersedia`

### 5.6 Health

| Method | Path | Auth | Deskripsi |
| --- | --- | --- | --- |
| GET | `/api/health` | No | `{ "status": "ok" }` |

---

## 6. Backend Design Detail

### 6.1 Stack & library

| Package | Fungsi |
| --- | --- |
| `express` | HTTP server |
| `cors` | CORS |
| `dotenv` | Env |
| `better-sqlite3` | DB sync |
| `bcryptjs` atau `bcrypt` | Password hash |
| `jsonwebtoken` | JWT |
| `zod` (disarankan) | Validasi request |
| `ts-node-dev` | Hot reload dev |
| `typescript` | Compile |

> Jika ingin minimal absolut sesuai plan, validasi manual di controller boleh; `zod` direkomendasikan untuk ketahanan.

### 6.2 Layering

```
Route → Middleware (auth/validate) → Controller → (Service opsional) → DB
```

Untuk MVP, **Controller + raw SQL di repository functions** sudah cukup:

```
src/db/repos/kas.repo.ts
src/db/repos/kegiatan.repo.ts
...
```

### 6.3 Auth middleware

```ts
// Pseudocode
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json(...);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json(...);
  }
}
```

JWT payload:

```ts
{
  sub: number;       // user id
  username: string;
  role: 'pengurus' | 'admin';
}
```

### 6.4 Error handling

- Central `errorHandler` middleware.
- Domain errors: `AppError(code, message, status)`.
- Jangan bocorkan stack trace ke client di production.

### 6.5 CORS

```ts
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: false, // JWT di header, bukan cookie
})
```

### 6.6 Keamanan tambahan (v1 minimal)

| Kontrol | Implementasi |
| --- | --- |
| Password hash | bcrypt cost 10–12 |
| JWT secret | env, min 32 char random |
| Input validation | semua POST/PUT/PATCH |
| SQL injection | prepared statements always |
| Register lockdown | disabled di production |
| Rate limit login | opsional P2 (`express-rate-limit`) |
| Helmet | opsional P2 |

### 6.7 Prepared statements (wajib)

```ts
db.prepare('INSERT INTO kas (tipe, kategori, jumlah, ...) VALUES (?, ?, ?, ...)').run(...)
```

Jangan string-concatenate user input ke SQL.

---

## 7. Frontend Design Detail

### 7.1 Stack

| Area | Pilihan |
| --- | --- |
| Framework | Vue 3 + `<script setup lang="ts">` |
| Build | Vite |
| CSS | Tailwind CSS 3.x |
| Router | Vue Router 4 |
| State | Pinia |
| HTTP | `fetch` wrapper atau `axios` |
| Icons | opsional (Heroicons / Lucide) |

### 7.2 Routing

| Path | Layout | Auth | Halaman |
| --- | --- | --- | --- |
| `/` | Public | No | Beranda (saldo + agenda) |
| `/login` | Public | Guest only | Form login |
| `/dashboard` | Dashboard | Yes | Overview ringkas (opsional redirect ke kas) |
| `/dashboard/kegiatan` | Dashboard | Yes | Manajemen kegiatan |
| `/dashboard/kas` | Dashboard | Yes | Manajemen kas |
| `/dashboard/inventaris` | Dashboard | Yes | Manajemen inventaris |

**Navigation guard**

```ts
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login' };
  if (to.meta.guestOnly && auth.isAuthenticated) return { name: 'dashboard' };
});
```

### 7.3 Pinia stores

#### `useAuthStore`

- State: `token`, `user`, `loading`, `error`
- Persist token: `localStorage` key `simas_token`
- Actions: `login`, `logout`, `fetchMe`, `hydrateFromStorage`

#### `useKasStore`

- State: `items`, `saldo`, `filterMonth`, `loading`
- Actions: `fetchSaldo`, `fetchList`, `create`, `cancel`

#### `useKegiatanStore`

- State: `items`, `loading`
- Actions: `fetchAll`, `fetchUpcoming`, `create`, `update`, `remove`

#### `useInventarisStore`

- State: `items`, `loading`
- Actions: `fetchAll`, `create`, `update`, `togglePinjam`, `setKondisi`, `remove`

### 7.4 API client

```ts
// services/api.ts
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('simas_token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  const body = await res.json();
  if (!res.ok || body.success === false) throw normalizeError(body, res.status);
  return body.data as T;
}
```

### 7.5 Komponen UI utama

| Komponen | Fungsi |
| --- | --- |
| `PublicNavbar` | Brand + link Login / Beranda |
| `SaldoCard` | Box saldo emerald/amber accent |
| `KegiatanTable` | Tabel agenda (publik & admin variants) |
| `RunningBanner` | Teks berjalan / pengumuman |
| `SidebarNav` | Link dashboard |
| `KasForm` | Form masuk/keluar |
| `KasTable` | Riwayat + badge cancel + warna jumlah |
| `MonthFilter` | Input `type="month"` |
| `InventarisTable` | Aksi toggle + kondisi |
| `InventarisForm` | Create/edit |
| `KegiatanForm` | Create/edit |
| `ConfirmDialog` | Konfirmasi cancel/delete |
| `Toast` / `Alert` | Feedback |
| `LoadingSpinner` | Loading state |
| `EmptyState` | Data kosong |

### 7.6 Design tokens (Tailwind)

Perluas `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      // pakai default emerald/amber/slate Tailwind
      // optional alias:
      brand: {
        primary: '#047857',    // emerald-700
        primaryDark: '#065f46',// emerald-800
        accent: '#f59e0b',     // amber-500
        accentDark: '#d97706', // amber-600
      }
    }
  }
}
```

**Mapping komponen → warna**

| Elemen | Class contoh |
| --- | --- |
| Public navbar | `bg-emerald-700 text-white` |
| Logo accent | `text-amber-500` |
| Dashboard sidebar | `bg-emerald-800 text-white` |
| Page background | `bg-slate-50` |
| Card | `bg-white shadow rounded-xl` |
| Primary button | `bg-emerald-700 hover:bg-emerald-800 text-white` |
| Accent button | `bg-amber-500 hover:bg-amber-600 text-white` |
| Kas masuk text | `text-green-600 font-semibold` |
| Kas keluar text | `text-red-600 font-semibold` |
| Badge dibatalkan | `bg-slate-200 text-slate-600 line-through` opsional |

### 7.7 Format tampilan

| Data | Format UI |
| --- | --- |
| Uang | `Rp 1.500.000` (locale `id-ID`) |
| Tanggal | `17 Juli 2026` atau biarkan `YYYY-MM-DD` di form |
| Waktu | `08:00` |

Util:

```ts
formatRupiah(n: number): string
formatTanggalID(isoDate: string): string
```

### 7.8 Form & validasi client

- Mirror validasi server (UX cepat).
- Server tetap authoritative.
- Input tanggal: `<input type="date">`.
- Input bulan filter: `<input type="month">` → kirim `YYYY-MM`.
- Input jumlah: number min 1; simpan sebagai integer rupiah.

---

## 8. Alur Sequence (penting)

### 8.1 Login

```
UI Login → POST /api/auth/login
         ← { token, user }
         → simpan token localStorage
         → redirect /dashboard
```

### 8.2 Publik load beranda

```
Beranda mount
  ├─ GET /api/kas/saldo        → SaldoCard
  └─ GET /api/kegiatan?upcoming=true&limit=10 → KegiatanTable
```

### 8.3 Create kas

```
KasForm submit
  → POST /api/kas (Bearer)
  ← data transaksi
  → kasStore.fetchList() + fetchSaldo()
  → toast sukses
```

### 8.4 Cancel kas

```
ConfirmDialog
  → PATCH /api/kas/:id/cancel { reason }
  → refresh list + saldo
```

---

## 9. Edge Cases & Business Rules

| Kasus | Perilaku yang diharapkan |
| --- | --- |
| Jumlah kas 0 atau negatif | `400 VALIDATION_ERROR` |
| Jumlah desimal | Tolak atau bulatkan ke integer; **prefer tolak** di v1 |
| Tanggal invalid | `400` |
| Cancel dua kali | `400` "Transaksi sudah dibatalkan" |
| Token expired di tengah sesi | API 401 → store logout → redirect login |
| Username login salah | `401` generic "Username atau password salah" |
| Hapus kegiatan yang sudah lewat | Diizinkan |
| Inventaris jumlah 0 | Tolak (`>= 1`) |
| Toggle pinjam saat rusak | Diizinkan (tidak blok) — opsional warning UI |
| SQLite locked (rare) | 500 + retry message; dokumentasikan single-writer |
| CORS salah origin | Browser block; pastikan env match |

### Aturan tanggal

- Seluruh field tanggal bisnis: **`YYYY-MM-DD`**.
- Timestamp sistem (`created_at`): ISO-like dari `datetime('now')` SQLite (UTC) — dokumentasikan; untuk MVP cukup konsisten server-side.

### Aturan kas & transparansi

1. Tidak ada endpoint hard delete kas di v1.
2. Soft-cancel membutuhkan `cancel_reason` non-kosong (min 3 karakter).
3. Saldo publik = query kanonik yang sama dengan dashboard.
4. `created_by` diisi dari `req.user.sub` jika tersedia.

---

## 10. Testing Strategy

### 10.1 Manual (wajib MVP — hari 5)

Checklist selaras PRD §12.

### 10.2 Automated (disarankan minimal)

| Layer | Scope |
| --- | --- |
| Backend unit/integration | Kas saldo calculation; cancel excludes from saldo; auth middleware |
| Frontend | Opsional: store unit test ringan |
| E2E | Opsional Playwright post-MVP |

Contoh kasus test backend:

1. Create masuk 1000 + keluar 400 → saldo 600  
2. Cancel masuk 1000 → saldo -400 (atau 0 jika tidak ada masuk lain)  
3. Create jumlah -1 → 400  
4. GET `/api/kas` tanpa token → 401  
5. GET `/api/kas/saldo` tanpa token → 200  

---

## 11. Deployment (MVP)

### Dev

```bash
# terminal 1
cd backend && npm run db:migrate && npm run db:seed && npm run dev

# terminal 2
cd frontend && npm run dev
```

### Produksi sederhana

1. `frontend`: `npm run build` → static di `dist/`
2. `backend`: `npm run build` && `npm start`
3. Serve frontend via:
   - Nginx static + proxy `/api` ke Node, **atau**
   - Express `express.static` untuk `frontend/dist`
4. Backup: cron copy `database.sqlite` harian

### Backup & restore

```bash
cp data/database.sqlite backups/database-$(date +%F).sqlite
```

Restore = stop app → replace file → start app.

---

## 12. Observability & Logging

MVP:

- `console` structured sederhana: `[INFO]`, `[ERROR]`
- Log request method + path + status (morgan opsional)
- Jangan log password atau full JWT

---

## 13. Rencana Implementasi (selaras plan 5 hari)

### Hari 1 — Scaffold

- [ ] Buat monorepo folders
- [ ] Backend: express + tsconfig + env + CORS + health
- [ ] Frontend: Vite vue-ts + Tailwind + Router + Pinia
- [ ] Palet warna di Tailwind
- [ ] README setup

### Hari 2 — Backend domain

- [ ] migrate + seed
- [ ] Auth login/JWT/middleware
- [ ] CRUD kegiatan
- [ ] Kas create/list/saldo/cancel
- [ ] CRUD inventaris + toggle

### Hari 3 — Frontend publik + stores

- [ ] PublicLayout + navbar
- [ ] Stores + api client
- [ ] Beranda: saldo + kegiatan + banner

### Hari 4 — Dashboard

- [ ] DashboardLayout sidebar
- [ ] Login page + guard
- [ ] Pages: kas, inventaris, kegiatan + forms/tables

### Hari 5 — Hardening

- [ ] Validasi E2E TypeScript
- [ ] Edge cases kas & tanggal
- [ ] CORS & error UX
- [ ] Cleanup; manual test checklist PRD

---

## 14. PR Plan (implementasi bertahap)

Urutan PR di bawah dirancang agar tiap PR reviewable & mergeable.

### PR-1: Monorepo scaffold & tooling

- **Scope:** struktur folder, package.json FE/BE, tsconfig, Vite, Tailwind base, Express hello/health, `.env.example`, README, `.gitignore` (sqlite, node_modules, dist)
- **Files:** `frontend/**`, `backend/**`, root docs
- **Depends on:** —
- **Done when:** `npm run dev` FE & BE jalan; `/api/health` OK

### PR-2: Database schema, migrate, seed

- **Scope:** connection better-sqlite3, migrate tables, seed admin
- **Files:** `backend/src/db/**`
- **Depends on:** PR-1
- **Done when:** `database.sqlite` terbentuk dengan 4 tabel + user seed

### PR-3: Auth API (login, me, middleware)

- **Scope:** bcrypt, JWT, routes auth, `requireAuth`
- **Files:** `backend/src/routes/auth*`, `middleware/auth*`, `controllers/auth*`
- **Depends on:** PR-2
- **Done when:** login mengembalikan token; `/me` terproteksi

### PR-4: Kegiatan API CRUD

- **Scope:** public GET, protected mutations
- **Depends on:** PR-3
- **Done when:** CRUD diuji via HTTP client

### PR-5: Kas API (create, list, saldo, cancel)

- **Scope:** business rules jumlah, soft-cancel, saldo query; **tanpa DELETE**
- **Depends on:** PR-3
- **Done when:** test manual saldo + cancel konsisten

### PR-6: Inventaris API CRUD + toggle

- **Scope:** endpoints inventaris
- **Depends on:** PR-3
- **Done when:** toggle pinjam & update kondisi OK

### PR-7: Frontend foundation (layout, router, auth store, api client)

- **Scope:** Public/Dashboard layout, login page, guards, theme tokens
- **Depends on:** PR-1, (PR-3 untuk integrasi login)
- **Done when:** login flow E2E ke dashboard kosong

### PR-8: Halaman publik beranda

- **Scope:** SaldoCard, kegiatan upcoming, banner
- **Depends on:** PR-4, PR-5, PR-7
- **Done when:** beranda menampilkan data live

### PR-9: Dashboard Kas UI

- **Scope:** form, tabel, filter bulan, cancel dialog, format rupiah
- **Depends on:** PR-5, PR-7
- **Done when:** pengurus mengelola kas full flow

### PR-10: Dashboard Kegiatan & Inventaris UI

- **Scope:** forms/tables/actions
- **Depends on:** PR-4, PR-6, PR-7
- **Done when:** CRUD UI lengkap

### PR-11: Hardening & polish

- **Scope:** validasi edge cases, empty/loading states, error messages ID, README final, optional static serve
- **Depends on:** PR-8–10
- **Done when:** checklist PRD §12 tercentang

---

## 15. Open Technical Questions

| # | Pertanyaan | Rekomendasi desain |
| --- | --- | --- |
| T1 | `bcrypt` native vs `bcryptjs`? | `bcryptjs` lebih mudah install cross-platform |
| T2 | Decimal money? | Integer rupiah v1 |
| T3 | Apakah perlu pagination kas? | Limit default 100 + filter bulan dulu |
| T4 | Timezone masjid? | Asumsikan WIB; tanggal bisnis dari form user |
| T5 | Serve FE dari Express? | Opsional di PR-11; dev tetap terpisah port |

---

## 16. Appendix

### A. Kategori kas default (frontend constant)

```ts
export const KATEGORI_MASUK = [
  'Infaq Jumat',
  'Infaq Harian',
  'Zakat',
  'Donasi Khusus',
  'Lainnya',
] as const;

export const KATEGORI_KELUAR = [
  'Operasional',
  'Utilitas',
  'Kebersihan',
  'Kegiatan',
  'Perawatan Aset',
  'Lainnya',
] as const;
```

### B. Contoh JWT claim

```json
{
  "sub": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1721200000,
  "exp": 1721286400
}
```

### C. Mapping plan.md → dokumen ini

| plan.md | PRD / DESIGN |
| --- | --- |
| Palet warna | PRD §7, DESIGN §7.6 |
| Stack FE/BE | DESIGN §3, §6, §7 |
| Tabel DB | DESIGN §4 (+ field audit/cancel) |
| Roadmap 5 hari | DESIGN §13, PR Plan §14 |
| No hard delete kas | PRD KAS-08, DESIGN KD-08 & §5.4 |
| Format tanggal | PRD NFR-07, DESIGN KD-10 & §9 |

### D. Referensi

- `plan.md` — cetak biru awal  
- `PRD.md` — requirements produk  
- Dokumen ini — spesifikasi teknis implementasi  
