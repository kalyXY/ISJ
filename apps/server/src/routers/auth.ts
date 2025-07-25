import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../prisma';
import { z } from 'zod';
import { loginHandler } from '../controllers/authController';
import { authenticate, redirectBasedOnRole } from '../middleware/auth';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Schéma de validation pour le login
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
});

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  role: z.enum(['admin', 'pending_parent']),
  status: z.enum(['active', 'inactive', 'en_attente']).optional()
});

// Schéma de validation pour la récupération de mot de passe
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide')
});

// Schéma de validation pour la réinitialisation de mot de passe
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères')
});

// Route de login (utilisant le contrôleur)
router.post('/login', async (req, res, next) => {
  console.log("🔍 Route /login appelée avec:", {
    email: req.body.email,
    hasPassword: !!req.body.password
  });
  
  try {
    // Validation simplifiée des données
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.log("🔍 Validation échouée:", validationResult.error.format());
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: validationResult.error.format() 
      });
    }
    
    console.log("🔍 Validation réussie, transmission au contrôleur");
    // Passer au contrôleur
    return loginHandler(req, res);
  } catch (error) {
    console.error("🔍 Erreur dans le middleware de validation:", error);
    next(error);
  }
});

// Route pour rediriger l'utilisateur selon son rôle
router.get('/redirect', authenticate, redirectBasedOnRole);

// Route pour récupérer l'utilisateur courant
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    console.log('📍 Route /api/auth/me appelée');
    console.log('👤 Utilisateur dans la requête:', req.user);
    
    const userId = req.user.userId;
    console.log('🆔 ID utilisateur extrait:', userId);
    
    if (!userId) {
      console.error('❌ Aucun ID utilisateur trouvé dans le token');
      return res.status(400).json({ message: 'Token invalide: ID utilisateur manquant' });
    }
    
    console.log('🔍 Recherche de l\'utilisateur dans la base de données avec ID:', userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true
      }
    });
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé dans la base de données avec ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter un statut par défaut si non défini
    const userWithDefaults = {
      ...user,
      status: user.status || 'active' // Par défaut, les utilisateurs existants sont actifs
    };
    
    console.log('✅ Utilisateur trouvé:', { id: user.id, email: user.email, role: user.role, status: userWithDefaults.status });
    return res.status(200).json({ 
      user: {
        ...userWithDefaults,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération de l\'utilisateur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    // Validation des données
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: validationResult.error.format() 
      });
    }

    const { firstName, lastName, email, password, role, status } = validationResult.data;

    // Vérification si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'pending_parent', // Par défaut, un compte parent en attente
        status: status || 'en_attente' // Par défaut, en attente de validation
      }
    });

    return res.status(201).json({
      message: role === 'pending_parent' 
        ? 'Compte créé avec succès. Un administrateur doit valider votre compte.' 
        : 'Compte créé avec succès',
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de récupération de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    // Validation des données
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Email invalide', 
        errors: validationResult.error.format() 
      });
    }

    const { email } = validationResult.data;

    // Recherche de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer que l'email n'existe pas
      return res.status(200).json({ message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation' });
    }

    // Génération d'un token aléatoire
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 heure

    // Mise à jour de l'utilisateur avec le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpires
      }
    });

    // Dans une application réelle, envoyer un email avec le lien de réinitialisation
    // Pour cette démo, on simule l'envoi d'un email
    console.log(`Lien de réinitialisation: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

    return res.status(200).json({ 
      message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation',
      // Pour la démo uniquement, on retourne le token
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Erreur de récupération de mot de passe:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de réinitialisation de mot de passe
router.post('/reset-password', async (req, res) => {
  try {
    // Validation des données
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: validationResult.error.format() 
      });
    }

    const { token, password } = validationResult.data;

    // Recherche de l'utilisateur avec le token valide
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpires: {
          gt: new Date() // Token non expiré
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    // Hashage du nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mise à jour du mot de passe et suppression du token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetExpires: null
      }
    });

    return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Erreur de réinitialisation de mot de passe:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Route de déconnexion
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Déconnexion réussie' });
});

// Route pour rafraîchir le token
router.post('/refresh-token', authenticateToken, async (req: any, res) => {
  try {
    console.log('📍 Route /api/auth/refresh-token appelée');
    
    // Récupérer l'utilisateur actuel à partir du token
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    if (!userId) {
      console.error('❌ Aucun ID utilisateur trouvé dans le token');
      return res.status(400).json({ message: 'Token invalide: ID utilisateur manquant' });
    }
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });
    
    if (!user) {
      console.error('❌ Utilisateur non trouvé dans la base de données avec ID:', userId);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Générer un nouveau token
    const tokenPayload = { userId: user.id, role: user.role };
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '7d' }
    );
    
    // Configurer le cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // laisser à false en dev, mis à true derrière HTTPS en prod
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en milliseconds
    });
    
    console.log('✅ Token rafraîchi pour:', user.email);
    return res.status(200).json({
      message: 'Token rafraîchi avec succès',
      token,
      user: {
        ...user,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors du rafraîchissement du token:', error);
    return res.status(500).json({
      message: 'Erreur serveur lors du rafraîchissement du token',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 