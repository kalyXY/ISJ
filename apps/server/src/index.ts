import "dotenv/config";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routers/auth";
import adminRoutes from "./routers/admin";
import academicsRoutes from "./routes/academics/academics.routes";
import enseignantsRoutes from './routes/enseignants.routes';
import { initDatabase } from "./lib/init-db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const app = express();

// Configuration CORS pour accepter uniquement les requêtes depuis le client Next.js
app.use(
  cors({
    origin: ["http://localhost:3000"], // Accepte uniquement les requêtes depuis le client Next.js
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true, // Permet d'envoyer des cookies avec les requêtes
    maxAge: 86400 // 24 heures
  })
);

app.use(express.json());
app.use(cookieParser());

// Route de login directe pour tester
app.post("/api/auth/direct-login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Tentative de connexion:", email);
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log("Utilisateur non trouvé:", email);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Mot de passe incorrect pour:", email);
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || "secret-key", {
      expiresIn: '7d'
    });

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en milliseconds
    });
    
    console.log("Connexion réussie pour:", email);
    res.status(200).json({ 
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token 
    });
  } catch (err) {
    console.error("Erreur de connexion:", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Routes d'authentification personnalisées avec gestion des rôles
app.use("/api/auth", authRoutes);

// Routes pour l'administration (admin uniquement)
app.use("/api/admin", adminRoutes);

// Routes pour la gestion académique
app.use("/api/academics", academicsRoutes);

// Routes pour la gestion des enseignants
app.use('/api/enseignants', enseignantsRoutes);

// Route de test pour vérifier que le serveur fonctionne
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Route de test pour l'API d'authentification
app.get("/api/auth/test", (_req, res) => {
  res.status(200).json({ message: "API d'authentification fonctionnelle" });
});

const port = process.env.PORT || 3001;

// Initialiser la base de données avant de démarrer le serveur
initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Serveur démarré sur le port ${port}`);
      console.log(`✅ CORS configuré pour accepter toutes les origines (mode développement)`);
    });
  })
  .catch((error) => {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  });
