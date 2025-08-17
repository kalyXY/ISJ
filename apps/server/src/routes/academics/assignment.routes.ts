import { Router } from 'express';
import {
  getSallesForClasse,
  getStudentsForClasse,
  assignStudentsToSalle,
  unassignStudentsFromSalle,
} from '../../controllers/academics/assignmentController';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

// Toutes les routes ici nécessitent une authentification
router.use(authMiddleware);

/**
 * @route GET /api/academics/assignment/classes/:classeId/salles
 * @description Récupère la liste des salles disponibles pour une classe logique.
 * @access Privé
 */
router.get('/classes/:classeId/salles', getSallesForClasse);

/**
 * @route GET /api/academics/assignment/classes/:classeId/students
 * @description Récupère les élèves d'une classe, avec option pour filtrer les non-affectés.
 * @access Privé
 */
router.get('/classes/:classeId/students', getStudentsForClasse);

/**
 * @route POST /api/academics/assignment/classes/:classeId/assign-students
 * @description Affecte en masse des élèves à une salle spécifique.
 * @access Privé
 */
router.post('/classes/:classeId/assign-students', assignStudentsToSalle);

/**
 * @route POST /api/academics/assignment/classes/:classeId/unassign-students
 * @description Désaffecte en masse des élèves d'une salle.
 * @access Privé
 */
router.post('/classes/:classeId/unassign-students', unassignStudentsFromSalle);

export default router;
