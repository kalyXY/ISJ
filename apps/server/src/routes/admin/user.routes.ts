import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateParent,
  getUnlinkedEtudiants,
  debugUsers,
} from '../../controllers/userController';

const router = express.Router();
const isAdmin = [authenticateToken, checkRole(['admin'])];

// Routes pour les utilisateurs
router.get('/', isAdmin, (req, res, next) => {
  if (req.query.role === 'student' && req.query.notLinkedToStudent === 'true') {
    return getUnlinkedEtudiants(req, res);
  }
  return getAllUsers(req, res);
});

// Route de test pour déboguer les utilisateurs
router.get('/debug', isAdmin, debugUsers);

router.get('/:id', isAdmin, getUserById);
router.post('/', isAdmin, createUser);
router.put('/:id', isAdmin, updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.patch('/:id/validate', isAdmin, validateParent);

export default router; 