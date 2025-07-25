import bcrypt from 'bcrypt';
import prisma from './index';
import "dotenv/config"; // Ajouter l'import de dotenv

async function main() {
  try {
    // Vérifier si un admin existe déjà
    const adminExists = await prisma.user.findFirst({
      where: {
        role: 'admin',
      },
    });

    // Si aucun admin n'existe, en créer un
    if (!adminExists) {
      // Créer un mot de passe haché pour l'admin
      const password = await bcrypt.hash('3Seniors?', 10);

      // Créer l'utilisateur admin
      await prisma.user.create({
        data: {
          firstName: 'Peter',
          lastName: 'Akilimali',
          email: 'peter23xp@gmail.com',
          password,
          role: 'admin',
          status: 'active', // S'assurer que l'admin est toujours actif
          emailVerified: true,
        },
      });

      console.log('✅ Utilisateur administrateur créé avec succès');
    } else {
      // S'assurer que l'admin existant a le statut actif
      if (adminExists.status !== 'active') {
        await prisma.user.update({
          where: { id: adminExists.id },
          data: { status: 'active' }
        });
        console.log('✅ Statut de l\'administrateur mis à jour vers "active"');
      }
      console.log('⚠️ Un utilisateur administrateur existe déjà');
    }

    // Ajouter d'autres seeds au besoin
    // Par exemple, créer des utilisateurs de test pour chaque rôle

    
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 