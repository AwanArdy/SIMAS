import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { 
  getSaldo,
  getKas,
  getKasById,
  createKas,
  cancelKas
} from "../controllers/kas.controller.js";

const router = Router();

// endpoint publik
router.get('/saldo', getSaldo);

// endpoint terproteksi
router.get('/', requireAuth, getKas);
router.get('/:id', requireAuth, getKasById);
router.post('/', requireAuth, createKas);
router.patch('/:id/cancel', requireAuth, cancelKas);

export default router;
