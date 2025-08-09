import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';
import { 
  checkEnseignantMatiere, 
  checkEnseignantClasse, 
  checkEnseignantEleve 
} from '../../middleware/enseignantMiddleware';

// Contrôleurs pour les périodes
import {
  getAllPeriodes,
  getPeriodeById,
  createPeriode,
  updatePeriode,
  deletePeriode,
  validatePeriode,
  getPeriodesActives
} from '../../controllers/academics/periodeController';

// Contrôleurs pour les notes
import {
  getAllNotes,
  getNotesByClasseAndPeriode,
  createNote,
  updateNote,
  deleteNote,
  getMoyenneEleve,
  getHistoriqueNote
} from '../../controllers/academics/noteController';

// Contrôleurs pour les bulletins et statistiques
import {
  getAllBulletins,
  genererBulletin,
  genererBulletinsClasse,
  getBulletinDetails,
  updateAppreciationBulletin,
  getStatistiquesClasse,
  getStatistiquesMatiere,
  telechargerBulletinPDF,
  telechargerBulletinsClassePDF
} from '../../controllers/academics/bulletinController';

// Contrôleurs pour les paramètres
import {
  getAllParametres,
  getParametreByKey,
  upsertParametre,
  deleteParametre,
  initialiserParametresDefaut,
  getParametresNotation,
  updateParametresLot
} from '../../controllers/academics/parametreController';

const router = express.Router();

// Middleware pour protéger toutes les routes
router.use(authenticateToken);

// ================================
// ROUTES POUR LES PÉRIODES
// ================================

// Routes publiques (enseignants et admins)
router.get('/periodes', getAllPeriodes);
router.get('/periodes/actives', getPeriodesActives);
router.get('/periodes/:id', getPeriodeById);

// Routes admin uniquement
router.post('/periodes', checkRole(['admin']), createPeriode);
router.put('/periodes/:id', checkRole(['admin']), updatePeriode);
router.delete('/periodes/:id', checkRole(['admin']), deletePeriode);
router.put('/periodes/:id/validate', checkRole(['admin']), validatePeriode);

// ================================
// ROUTES POUR LES NOTES
// ================================

// Routes pour les enseignants et admins
router.get('/notes', getAllNotes);
router.get('/notes/classe/:classeId/periode/:periodeId', checkEnseignantClasse, getNotesByClasseAndPeriode);
router.get('/notes/:id/historique', getHistoriqueNote);
router.get('/moyennes/eleve/:studentId/periode/:periodeId', checkEnseignantEleve, getMoyenneEleve);

// Routes pour créer/modifier des notes (enseignants titulaires de la matière uniquement)
router.post('/notes', checkEnseignantMatiere, createNote);
router.put('/notes/:id', checkEnseignantMatiere, updateNote);
router.delete('/notes/:id', checkEnseignantMatiere, deleteNote);

// ================================
// ROUTES POUR LES BULLETINS
// ================================

// Routes de consultation (enseignants et admins)
router.get('/bulletins', getAllBulletins);
router.get('/bulletins/details/:studentId/:periodeId', checkEnseignantEleve, getBulletinDetails);

// Routes de génération (admins uniquement)
router.post('/bulletins/generer/:studentId/:periodeId', checkRole(['admin']), genererBulletin);
router.post('/bulletins/generer-classe/:classeId/:periodeId', checkRole(['admin']), genererBulletinsClasse);
router.put('/bulletins/:id/appreciation', checkRole(['admin']), updateAppreciationBulletin);

// Routes de téléchargement PDF
router.get('/bulletins/pdf/:studentId/:periodeId', checkEnseignantEleve, telechargerBulletinPDF);
router.get('/bulletins/pdf-classe/:classeId/:periodeId', checkEnseignantClasse, telechargerBulletinsClassePDF);

// ================================
// ROUTES POUR LES STATISTIQUES
// ================================

// Routes de statistiques (enseignants et admins)
router.get('/statistiques/classe/:classeId/periode/:periodeId', checkEnseignantClasse, getStatistiquesClasse);
router.get('/statistiques/matieres/:classeId/:periodeId', checkEnseignantClasse, getStatistiquesMatiere);

// ================================
// ROUTES POUR LES PARAMÈTRES
// ================================

// Routes de consultation des paramètres
router.get('/parametres', getAllParametres);
router.get('/parametres/notation', getParametresNotation);
router.get('/parametres/:cle', getParametreByKey);

// Routes admin pour la gestion des paramètres
router.post('/parametres', checkRole(['admin']), upsertParametre);
router.put('/parametres/:cle', checkRole(['admin']), upsertParametre);
router.delete('/parametres/:cle', checkRole(['admin']), deleteParametre);
router.post('/parametres/initialiser', checkRole(['admin']), initialiserParametresDefaut);
router.put('/parametres/lot', checkRole(['admin']), updateParametresLot);

export default router;