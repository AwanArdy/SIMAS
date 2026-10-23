import type { Request, Response } from "express";
import db from "../db/connection.js";

export const getInventaris = (req: Request, res: Response) => {
  try {
    const { kondisi, status_pinjam } = req.query;
    let query = 'SELECT * FROM inventaris';
    const params: any[] = [];
    const conditions: string[] = [];

    // filter opsional berdasarkan kondisi atau status status pinjam
    if (kondisi) {
      conditions.push('kondisi = ?');
      params.push(kondisi);
    }
    if (status_pinjam) {
      conditions.push('status_pinjam = ?');
      params.push(status_pinjam);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY nama_barang ASC';

    const data = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
};

export const getInventarisById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = db.prepare('SELECT * FROM inventaris WHERE id = ?').get(id);

    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } });
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const createInventaris = (req: Request, res: Response) => {
  try {
    const { nama_barang, jumlah, kondisi, status_pinjam, lokasi_penyimpanan } = req.body;

    // Validasi input[cite: 2]
    if (!nama_barang || jumlah === undefined || jumlah < 1) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama barang wajib diisi dan jumlah minimal 1' } });
    }

    const setKondisi = kondisi || 'baik';
    const setStatus = status_pinjam || 'tersedia';

    const insertQuery = db.prepare(`
      INSERT INTO inventaris (nama_barang, jumlah, kondisi, status_pinjam, lokasi_penyimpanan)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(nama_barang, jumlah, setKondisi, setStatus, lokasi_penyimpanan || null);
    const newData = db.prepare('SELECT * FROM inventaris WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, data: newData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const updateInventaris = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama_barang, jumlah, kondisi, status_pinjam, lokasi_penyimpanan } = req.body;

    if (!nama_barang || jumlah === undefined || jumlah < 1) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Nama barang wajib diisi dan jumlah minimal 1' } });
    }

    const updateQuery = db.prepare(`
      UPDATE inventaris 
      SET nama_barang = ?, jumlah = ?, kondisi = ?, status_pinjam = ?, lokasi_penyimpanan = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = updateQuery.run(nama_barang, jumlah, kondisi, status_pinjam, lokasi_penyimpanan || null, id);

    if (result.changes === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } });

    const updatedData = db.prepare('SELECT * FROM inventaris WHERE id = ?').get(id);
    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const togglePinjam = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Ambil status saat ini
    const current: any = db.prepare('SELECT status_pinjam FROM inventaris WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } });

    // Server melakukan flip pada status peminjaman (tersedia <-> dipinjam)[cite: 1]
    const newStatus = current.status_pinjam === 'tersedia' ? 'dipinjam' : 'tersedia';

    db.prepare(`UPDATE inventaris SET status_pinjam = ?, updated_at = datetime('now') WHERE id = ?`).run(newStatus, id);
    const updatedData = db.prepare('SELECT * FROM inventaris WHERE id = ?').get(id);

    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const setKondisi = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kondisi } = req.body;

    if (!['baik', 'rusak', 'perlu_perbaikan'].includes(kondisi)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Kondisi tidak valid' } });
    }

    const result = db.prepare(`UPDATE inventaris SET kondisi = ?, updated_at = datetime('now') WHERE id = ?`).run(kondisi, id);
    if (result.changes === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } });

    const updatedData = db.prepare('SELECT * FROM inventaris WHERE id = ?').get(id);
    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const deleteInventaris = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM inventaris WHERE id = ?').run(id);

    if (result.changes === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Barang tidak ditemukan' } });

    return res.status(200).json({ success: true, data: null });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
