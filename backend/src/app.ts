import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import kegiatanRoutes from './routes/kegiatan.routes.js';
import kasRoutes from './routes/kas.routes.js';
import inventarisRoutes from './routes/inventaris.routes.js';

const app = express()

// middleware
app.use(express.json());

// cors
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: false
}));

// health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// TODO: routes
app.use('/api/auth', authRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/kas', kasRoutes);
app.use('/api/inventaris', inventarisRoutes);

// cemtral error handler middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Terjadi kesalahan pada server',
      details: err.details || []
    }
  });
});

export default app;
