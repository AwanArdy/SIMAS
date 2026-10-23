import db from './connection';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('[INFO] Memulai proses seeding database...');

try {
  // Mengambil kredensial dari .env atau menggunakan nilai default untuk dev
  const adminUsername = process.env.SEED_ADMIN_USER || 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASS || 'admin123';

  // Memeriksa apakah user admin sudah ada agar script bersifat idempotent
  const existingAdmin = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);

  if (!existingAdmin) {
    // Hash password menggunakan bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);

    // Menyisipkan data admin ke tabel users[cite: 1]
    const insertUser = db.prepare(`
      INSERT INTO users (username, password, role) 
      VALUES (?, ?, ?)
    `);
    
    insertUser.run(adminUsername, hashedPassword, 'admin');
    console.log(`[INFO] User admin '${adminUsername}' berhasil dibuat.`);
  } else {
    console.log(`[INFO] User admin '${adminUsername}' sudah ada. Melewati pembuatan user.`);
  }

  console.log('[INFO] Seeding database selesai.');
} catch (error) {
  console.error('[ERROR] Gagal melakukan seeding database:', error);
  process.exit(1);
}
