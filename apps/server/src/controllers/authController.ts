import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma';

export const loginHandler = async (req: express.Request, res: express.Response) => {
  console.log("⭐ Appel de loginHandler");
  console.log("⭐ Corps de la requête:", req.body);
  
  const { email, password } = req.body;
  
  try {
    console.log("⭐ Recherche de l'utilisateur:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log("⭐ Utilisateur non trouvé:", email);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    console.log("⭐ Utilisateur trouvé, vérification du mot de passe");
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log("⭐ Mot de passe incorrect pour:", email);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    
    console.log("⭐ Mot de passe correct, génération du token JWT");
    const tokenPayload = { userId: user.id, role: user.role };
    console.log("⭐ Payload du token:", tokenPayload);
    
    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || "secret-key", 
      { expiresIn: '7d' }  // Change from 1d to 7d for longer token validity
    );
    
    console.log("⭐ Token généré:", token.substring(0, 20) + "...");
    console.log("⭐ Configuration du cookie et envoi de la réponse");
    // Utiliser SameSite="lax" afin que le cookie soit envoyé sur localhost
    // entre le front (port 3000) et l'API (port 3001) sans exiger HTTPS.
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // laisser à false en dev, mis à true derrière HTTPS en prod
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en milliseconds
    });
    
    return res.status(200).json({ 
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token 
    });
  } catch (err) {
    console.error("❌ ERREUR dans loginHandler:", err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}; 