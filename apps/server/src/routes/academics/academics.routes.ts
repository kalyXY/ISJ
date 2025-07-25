import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';

// Contrôleurs pour les sections
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
} from '../../controllers/academics/sectionController';

// Contrôleurs pour les options
import {
  getAllOptions,
  getOptionById,
  createOption,
  updateOption,
  deleteOption
} from '../../controllers/academics/optionController';

// Contrôleurs pour les classes
import {
  getAllClasses,
  getClasseById,
  createClasse,
  updateClasse,
  deleteClasse
} from '../../controllers/academics/classeController';

// Contrôleurs pour les matières
import {
  getAllMatieres,
  getMatieresByClasse,
  getMatiereById,
  createMatiere,
  updateMatiere,
  deleteMatiere
} from '../../controllers/academics/matiereController';

// Contrôleurs pour les années scolaires
import {
  getAllAnneesScolaires,
  getAnneeScolareCourante,
  getAnneeScolaireById,
  createAnneeScolaire,
  updateAnneeScolaire,
  deleteAnneeScolaire,
  setCurrentAnneeScolaire
} from '../../controllers/academics/anneeScolaireController';

const router = express.Router();

// Middleware pour protéger toutes les routes académiques
router.use(authenticateToken, checkRole(['admin']));

// Routes pour les sections
router.get('/sections', getAllSections);
router.get('/sections/:id', getSectionById);
router.post('/sections', createSection);
router.put('/sections/:id', updateSection);
router.delete('/sections/:id', deleteSection);

// Routes pour les options
router.get('/options', getAllOptions);
router.get('/options/:id', getOptionById);
router.post('/options', createOption);
router.put('/options/:id', updateOption);
router.delete('/options/:id', deleteOption);

// Routes pour les classes
router.get('/classes', getAllClasses);
router.get('/classes/:id', getClasseById);
router.post('/classes', createClasse);
router.put('/classes/:id', updateClasse);
router.delete('/classes/:id', deleteClasse);

// Routes pour les matières
router.get('/matieres', getAllMatieres);
router.get('/matieres/classe/:classeId', getMatieresByClasse);
router.get('/matieres/:id', getMatiereById);
router.post('/matieres', createMatiere);
router.put('/matieres/:id', updateMatiere);
router.delete('/matieres/:id', deleteMatiere);

// Routes pour les années scolaires
router.get('/annees', getAllAnneesScolaires);
router.get('/annees/courante', getAnneeScolareCourante);
router.get('/annees/:id', getAnneeScolaireById);
router.post('/annees', createAnneeScolaire);
router.put('/annees/:id', updateAnneeScolaire);
router.delete('/annees/:id', deleteAnneeScolaire);
router.put('/annees/:id/setCurrent', setCurrentAnneeScolaire);

export default router; 