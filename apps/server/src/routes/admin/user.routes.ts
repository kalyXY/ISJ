import express from 'express';
import { authenticateToken, checkRole } from '../../middleware/authMiddleware';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateParent,
} from '../../controllers/userController';

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est administrateur
const isAdmin = [authenticateToken, checkRole(['admin'])];

// Routes pour les utilisateurs
router.get('/', isAdmin, getAllUsers);
router.get('/:id', isAdmin, getUserById);
router.post('/', isAdmin, createUser);
router.put('/:id', isAdmin, updateUser);
router.delete('/:id', isAdmin, deleteUser);
router.patch('/:id/validate', isAdmin, validateParent);

export default router; 