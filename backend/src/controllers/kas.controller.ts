import type { Request, Response } from "express";
import db from "../db/connection.js";

export const getSaldo = (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN tipe = 'masuk' AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0) AS total_masuk,
        COALESCE(SUM(CASE WHEN tipe = 'keluar' AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0) AS total_keluar,
        (
          COALESCE(SUM(CASE WHEN tipe = 'masuk' AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN tipe = 'keluar' AND is_cancelled = 0 THEN jumlah ELSE 0 END), 0)
        ) AS saldo
      FROM kas;
    `;

    const data = db.prepare(query).get() as any;

    return res.status(200).json({
      success: true,
      data: {
        saldo: data.saldo,
        total_masuk: data.total_masuk,
        total_keluar: data.total_keluar,
        as_of: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

export const getKas = (req: Request, res: Response) => {
  try {
    const { month, include_cancelled } = req.query;
    let query = 'SELECT * FROM kas';
    const params: any[] = [];
    const conditions: string[] = [];

    // filter berdasarkan bulan
    if (month && typeof month === 'string') {
      conditions.push("tanggal LIKE ?");
      params.push(`${month}%`)
    }

    // filter cancelled
    if (include_cancelled !== 'true') {
      conditions.push("is_cancelled = 0");
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY tanggal DESC, id DESC';

    const data = db.prepare(query).all(...params);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
};

export const getKasById = (req: Request, res: Response) => {
  try {
    const { id } =req.params;
    const data = db.prepare('SELECT * FROM kas WHERE id = ?').get(id);

    if (!data) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Data kas tidak ditemukan' } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
};

export const createKas = (req: Request, res: Response) => {
  try {
    const { tipe, kategori, jumlah, keterangan, tanggal, bukti_nota } = req.body;
    const userId = req.user?.sub;

    // validasi aturan bisnis kritis
    if (!['masuk', 'keluar'].includes(tipe)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: "Tipe harus 'masuk' atau 'keluar'" } });
    }
    if (!Number.isInteger(jumlah) || jumlah <= 0) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: "Jumlah harus berupa angka lebih dari 0" } });
    }
    if (!tanggal || !tanggal.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: "Format tanggal tidak valid (YYYY-MM-DD)" } });
    }
    if (!kategori) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: "Kategori wajib diisi" } });
    }

    const insertQuery = db.prepare(`
      INSERT INTO kas (tipe, kategori, jumlah, keterangan, tanggal, bukti_nota, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(tipe, kategori, jumlah, keterangan || null, tanggal, bukti_nota || null, userId);
    const newData = db.prepare('SELECT * FROM kas WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ success: true, data: newData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', error: error.message } });
  }
};

export const cancelKas = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancel_reason } = req.body;

    if (!cancel_reason || cancel_reason.trim().length < 3) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', error: 'Alasan pembatalan wajib diisi' } });
    }

    const existing: any = db.prepare('SELECT is_cancelled FROM kas WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', error: 'Data kas tidak ditemukan' } })
    }
    if (existing.is_cancelled === 1) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', error: "Transaksi ini sudah dibatalkan" } })
    }

    const updateQuery = db.prepare(`
      UPDATE kas
      SET is_cancelled = 1, cancelled_at = datetime('now'), cancel_reason = ?, updated_at = datetime('now')
      WHERE id = ?
    `);

    updateQuery.run(cancel_reason, id);
    const updatedData = db.prepare('SELECT * FROM kas WHERE id = ?').get(id);

    return res.status(200).json({ success: true, data: updatedData });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', error: error.message } })
  }
};
