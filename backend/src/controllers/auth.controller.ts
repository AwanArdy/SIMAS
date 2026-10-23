import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/connection';

export const login = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // validasi input dasar
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username dan password wajib diisi',
        },
      });
    }

    const user: any = db.prepare('SELECT id, username, password, role FROM users WHERE username = ?').get(username);

    // jika user tidak ditemukan atau password salah
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Username atau password salah',
        },
      });
    }

    // pembuatan JWT payload
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET || 'rahasi1234';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    // sign JWT token
    const token = jwt.sign(payload, secret, { expiresIn });

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

export const getMe = (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Tidak terautentikasi' });
  }

  return res.status(200).json({
    success: true,
    data: { user },
  });
};
