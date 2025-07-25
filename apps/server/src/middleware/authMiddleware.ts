import express from 'express';
import jwt from 'jsonwebtoken';

// Interface pour étendre Request avec l'utilisateur
interface AuthenticatedRequest extends express.Request {
  user?: any;
}

export const authenticateToken = (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  console.log('🔒 Middleware authenticateToken - Headers:', {
    authorization: req.headers["authorization"],
    cookies: req.cookies
  });

  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1] || req.cookies.token;

  if (!token) {
    console.log('❌ Aucun token trouvé dans les headers ou cookies');
    return res.status(401).json({ message: "Authentification requise" });
  }

  try {
    console.log('🔑 Tentative de vérification du token avec secret:', (process.env.JWT_SECRET || 'secret-key').substring(0, 3) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    console.log('✅ Token vérifié avec succès:', decoded);
    
    // Vérifier que le token contient bien un userId
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      console.error('❌ Token invalide: structure incorrecte', decoded);
      return res.status(401).json({ message: "Token invalide: structure incorrecte" });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification:", error);
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour vérifier les rôles
export const checkRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
    console.log('👮 Middleware checkRole - Rôles autorisés:', roles);
    console.log('👮 Middleware checkRole - Utilisateur:', req.user);

    if (!req.user) {
      console.log('❌ Aucun utilisateur trouvé dans la requête');
      return res.status(401).json({ message: "Authentification requise" });
    }

    const userRole = req.user.role;
    console.log(`👮 Rôle de l'utilisateur: ${userRole}`);
    
    if (!roles.includes(userRole)) {
      console.log(`❌ Accès non autorisé pour le rôle ${userRole}`);
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    console.log('✅ Accès autorisé');
    next();
  };
}; 