import express from 'express';
import { authenticateToken, checkRole } from '../middleware/authMiddleware';
import {
  getAllEnseignants,
  createEnseignant,
  updateEnseignant,
  deleteEnseignant,
  assignClasseMatiere,
  getEnseignantPresences,
  getEnseignantPerformance
} from '../controllers/enseignantController';

const router = express.Router();

// Protéger toutes les routes (admin uniquement)
router.use(authenticateToken, checkRole(['admin']));

router.get('/', getAllEnseignants);
router.post('/', createEnseignant);
router.put('/:id', updateEnseignant);
router.delete('/:id', deleteEnseignant);
router.patch('/:id/assign', assignClasseMatiere);
router.get('/:id/presences', getEnseignantPresences);
router.get('/:id/performance', getEnseignantPerformance);

export default router; 