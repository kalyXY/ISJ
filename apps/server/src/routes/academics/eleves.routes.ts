import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';
import {
  getAllEleves,
  createEleve,
  getEleveById,
  updateEleve,
  archiveEleve,
  generateStudentInfo
} from '../../controllers/eleveController';

const router = express.Router();
const isAdmin = [authenticateToken, checkRole(['admin'])];

// Route pour générer les informations automatiques
router.post('/generate-info', isAdmin, generateStudentInfo);

// Routes CRUD pour les élèves
router.get('/', isAdmin, getAllEleves);
router.post('/', isAdmin, createEleve);
router.get('/:id', isAdmin, getEleveById);
router.put('/:id', isAdmin, updateEleve);
router.delete('/:id', isAdmin, archiveEleve);

export default router; 