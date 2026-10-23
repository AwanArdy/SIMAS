import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// mendefinisikan struktur payload JWT sesuai dokumen desain
export interface AppJwtPayload {
  sub: number;
  username: string;
  role: 'pengurus' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AppJwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // cek keberadaan header bearer token
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNATHORIZED',
        message: 'Akses ditolak. Token tidak ditemukan atau format salah'
      }
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'rahasi1234';

  try {
    const decoded = jwt.verify(token, secret) as unknown as AppJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNATHORIZED',
        message: 'Sesi telah habis atau token tidak valid'
      }
    });
  }
};
