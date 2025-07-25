import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';

// Interface pour étendre Request avec l'utilisateur
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: string;
    role: string;
  };
}

// Middleware d'authentification général
export const authenticate = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  try {
    // Récupérer le token du header Authorization ou des cookies
    const token = req.cookies.token || 
                 (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key') as {
      userId: string;
      role: string;
    };

    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à la requête
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

// Middleware pour vérifier le rôle
export const checkRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

// Middleware pour rediriger selon le rôle
export const redirectBasedOnRole = (req: AuthenticatedRequest, res: express.Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }

  switch (req.user.role) {
    case 'admin':
      return res.json({ redirect: '/admin/dashboard' });
    case 'teacher':
      return res.json({ redirect: '/teacher/dashboard' });
    case 'student':
      return res.json({ redirect: '/student/dashboard' });
    case 'parent':
      return res.json({ redirect: '/parent/dashboard' });
    default:
      return res.json({ redirect: '/login' });
  }
}; 