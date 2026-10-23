import db from './connection';

console.log('[INFO] Memulai migrasi database...');

try {
  // 1. Tabel users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password   TEXT NOT NULL,          
      role       TEXT NOT NULL DEFAULT 'pengurus'
                 CHECK (role IN ('pengurus', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  console.log('[INFO] Tabel users siap.');

  // 2. Tabel kegiatan[cite: 1]
  db.exec(`
    CREATE TABLE IF NOT EXISTS kegiatan (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      nama_kegiatan  TEXT NOT NULL,
      tanggal        TEXT NOT NULL,       
      waktu          TEXT NOT NULL,       
      lokasi         TEXT NOT NULL,
      pemateri       TEXT,
      keterangan     TEXT,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_kegiatan_tanggal ON kegiatan (tanggal);
  `);
  console.log('[INFO] Tabel kegiatan siap.');

  // 3. Tabel kas[cite: 1]
  db.exec(`
    CREATE TABLE IF NOT EXISTS kas (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      tipe            TEXT NOT NULL CHECK (tipe IN ('masuk', 'keluar')),
      kategori        TEXT NOT NULL,
      jumlah          INTEGER NOT NULL CHECK (jumlah > 0),  
      keterangan      TEXT,
      tanggal         TEXT NOT NULL,      
      bukti_nota      TEXT,               
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
  `);
  console.log('[INFO] Tabel kas siap.');

  // 4. Tabel inventaris[cite: 1]
  db.exec(`
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
  `);
  console.log('[INFO] Tabel inventaris siap.');

  console.log('[INFO] Migrasi database berhasil diselesaikan.');
} catch (error) {
  console.error('[ERROR] Gagal melakukan migrasi database:', error);
  process.exit(1);
}
