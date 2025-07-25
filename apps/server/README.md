# École Saint Joseph - Système d'Authentification

Ce système d'authentification permet de gérer les utilisateurs de l'application selon différents rôles (admin, enseignant, étudiant, parent).

## Configuration de la base de données MongoDB

1. Assurez-vous d'avoir MongoDB installé localement ou utilisez un service comme MongoDB Atlas

2. Configurez votre fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   DATABASE_URL=mongodb://username:password@localhost:27017/ecole-saint-joseph
   JWT_SECRET=votre_cle_secrete_jwt
   CORS_ORIGIN=http://localhost:5173
   ```

3. Remplacez l'URL de connexion MongoDB par votre propre URL

## Structure des collections

Le système utilise les collections MongoDB suivantes :

- **users**: Stocke les informations des utilisateurs avec leurs rôles
- **sessions**: Gère les sessions utilisateurs 
- **accounts**: Pour les connexions via d'autres fournisseurs (optionnel)
- **verifications**: Pour la vérification d'email (optionnel)

## Initialisation de la base de données

Pour initialiser la base de données avec un utilisateur administrateur et des utilisateurs de test :

```bash
npm run db:push    # Pour créer les collections et indexes
npm run db:seed    # Pour créer les utilisateurs de base
```

## Utilisateurs par défaut

| Rôle       | Email                         | Mot de passe   |
|------------|-------------------------------|---------------|
| Admin      | admin@ecole-saintjoseph.cd    | Admin@123     |
| Enseignant | enseignant@ecole-saintjoseph.cd | Teacher@123  |
| Étudiant   | etudiant@ecole-saintjoseph.cd | Student@123   |
| Parent     | parent@ecole-saintjoseph.cd   | Parent@123    |

## Routes d'authentification

- `POST /api/auth/register` : Inscription d'un nouvel utilisateur
- `POST /api/auth/login` : Connexion d'un utilisateur
- `GET /api/auth/me` : Récupération des informations de l'utilisateur connecté
- `POST /api/auth/logout` : Déconnexion
- `POST /api/auth/forgot-password` : Demande de réinitialisation de mot de passe
- `POST /api/auth/reset-password` : Réinitialisation du mot de passe

## Gestion des rôles

Le système gère quatre types de rôles avec des niveaux d'accès différents :

1. **Admin** : Accès complet au système
2. **Teacher** (Enseignant) : Gestion des étudiants, des notes et des cours
3. **Student** (Étudiant) : Accès à son profil, ses cours et ses notes
4. **Parent** : Suivi des résultats et des absences de ses enfants

## Sécurité

- Mots de passe hachés avec bcrypt
- Authentification via JWT avec cookies httpOnly
- Protection CSRF
- Validation des données avec Zod
- Gestion des sessions avec expiration 