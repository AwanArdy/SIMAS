import type { Request, Response } from 'express';
import db from '../db/connection.js';

export const getKegiatan = (req: Request, res: Response) => {
  try {
    const { upcoming, limit } = req.query;
    let query = 'SELECT * FROM kegiatan';
    const params: any[] = [];

    // Filter kegiatan mendatang berdasarkan tanggal saat ini
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query += ' WHERE tanggal >= ? ORDER BY tanggal ASC';
      params.push(today);
    } else {
      query += ' ORDER BY tanggal DESC, waktu DESC';
    }

    if (limit && !isNaN(Number(limit))) {
      query += ' LIMIT ?';
      params.push(Number(limit));
    }

    const data = db.prepare(query).all(...params);

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

export const getKegiatanById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = db.prepare('SELECT * FROM kegiatan WHERE id = ?').get(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kegiatan tidak ditemukan' }
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

export const createKegiatan = (req: Request, res: Response) => {
  try {
    const { nama_kegiatan, tanggal, waktu, lokasi, pemateri, keterangan } = req.body;

    if (!nama_kegiatan || !tanggal || !waktu || !lokasi) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Nama kegiatan, tanggal, waktu dan lokasi wajib diisi'}
      });
    }

    const insertQuery = db.prepare(`
      INSERT INTO kegiatan (nama_kegiatan, tanggal, waktu, lokasi, pemateri, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(
      nama_kegiatan,
      tanggal,
      waktu,
      lokasi,
      pemateri || null,
      keterangan || null
    );

    const newData = db.prepare('SELECT * FROM kegiatan WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, data: newData });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

export const updateKegiatan = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama_kegiatan, tanggal, waktu, lokasi, pemateri, keterangan } = req.body;

    if (!nama_kegiatan || !tanggal || !waktu || !lokasi) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Field wajib tidak boleh kosong' }
      });
    }

    const updateQuery = db.prepare(`
      UPDATE kegiatan
      SET nama_kegiatan = ?, tanggal = ?, wakt = ?, lokasi = ?, pemateri = ?, keterangan = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    const result = updateQuery.run(
      nama_kegiatan,
      tanggal,
      waktu,
      lokasi,
      pemateri || null,
      keterangan || null,
      id
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kegiatan tidak ditemukan' }
      });
    }

    const updatedData = db.prepare('SELECT * FROM kegiatan WHERE id = ?').get(id);
    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    });
  }
};

export const deleteKegiatan = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleteQuery = db.prepare('DELETE FROM kegiatan WHERE id = ?');
    const result = deleteQuery.run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Kegiatan tidak ditemukan' }
      });
    }

    return res.status(200).json({ success: true, data: null });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message }
    })
  }
}
