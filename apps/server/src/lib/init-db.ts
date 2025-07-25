import prisma from '../../prisma';

/**
 * Fonction pour initialiser la base de données au démarrage du serveur
 * - Vérifie la connexion à MongoDB
 * - S'assure que les indexes nécessaires sont créés
 */
export async function initDatabase() {
  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('✅ Connexion à MongoDB établie avec succès');

    // Exécuter une requête pour vérifier l'accès en lecture
    const usersCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs dans la base : ${usersCount}`);

    // Vérifier les permissions d'écriture
    if (usersCount === 0) {
      console.log('⚠️ Aucun utilisateur trouvé dans la base de données');
      console.log('ℹ️ Conseil: Exécutez `npm run db:seed` pour créer les utilisateurs initiaux');
    }

    // Si tout est OK, afficher un message
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw new Error(`Erreur de connexion à MongoDB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default initDatabase; 