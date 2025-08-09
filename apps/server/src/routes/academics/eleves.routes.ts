import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';
import {
  getAllEleves,
  createEleve,
  getEleveById,
  updateEleve,
  archiveEleve,
  generateStudentInfo,
  getElevesByClasse,
  addEleveToClasse
} from '../../controllers/eleveController';

const router = express.Router();
const isAdmin = [authenticateToken, checkRole(['admin'])];

// Route pour générer les informations automatiques
router.post('/generate-info', isAdmin, generateStudentInfo);

// Routes pour la gestion des élèves dans les classes
router.get('/classe/:classeId', isAdmin, getElevesByClasse);
router.post('/add-to-classe', isAdmin, addEleveToClasse);

// Routes CRUD pour les élèves
router.get('/', isAdmin, getAllEleves);
router.post('/', isAdmin, createEleve);
router.get('/:id', isAdmin, getEleveById);
router.put('/:id', isAdmin, updateEleve);
router.delete('/:id', isAdmin, archiveEleve);

export default router; 