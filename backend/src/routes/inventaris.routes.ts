import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  getInventaris, 
  getInventarisById, 
  createInventaris, 
  updateInventaris, 
  togglePinjam,
  setKondisi,
  deleteInventaris
} from '../controllers/inventaris.controller.js';

const router = Router();

// Seluruh endpoint inventaris membutuhkan autentikasi (Bearer token JWT)[cite: 1]
router.use(requireAuth);

router.get('/', getInventaris);
router.get('/:id', getInventarisById);
router.post('/', createInventaris);
router.put('/:id', updateInventaris);
router.patch('/:id/toggle-pinjam', togglePinjam); // Endpoint untuk aksi cepat meminjam/mengembalikan[cite: 1]
router.patch('/:id/kondisi', setKondisi);         // Endpoint untuk update kondisi barang spesifik[cite: 1]
router.delete('/:id', deleteInventaris);          // Diizinkan hard-delete untuk MVP/v1[cite: 1, 2]

export default router;
