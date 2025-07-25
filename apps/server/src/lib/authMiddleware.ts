import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from './auth';
import prisma from '../../prisma';

// Type pour la payload du JWT
interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// Middleware pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajouter l'utilisateur à l'objet request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

// Middlewares spécifiques pour chaque rôle
export const isAdmin = hasRole(['admin']);
export const isTeacher = hasRole(['admin', 'teacher']);
export const isStudent = hasRole(['student']);
export const isParent = hasRole(['parent']);

// Étendre l'interface Request pour inclure l'utilisateur
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
} 