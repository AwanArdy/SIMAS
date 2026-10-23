import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getKegiatan,
  getKegiatanById,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan
} from '../controllers/kegiatan.controller.js';

const router = Router();

// endpoint publik (tanpa token)
router.get('/', getKegiatan);
router.get('/:id', getKegiatanById);

// endpoint terproteksi
router.post('/', requireAuth, createKegiatan);
router.put('/:id', requireAuth, updateKegiatan);
router.delete('/:id', requireAuth, deleteKegiatan);

export default router;
