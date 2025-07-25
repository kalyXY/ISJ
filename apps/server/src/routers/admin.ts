import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../prisma';
import { z } from 'zod';
import { authenticateToken, checkRole } from '../middleware/authMiddleware';
import userRoutes from '../routes/admin/user.routes';

const router = express.Router();

// Middleware pour vérifier que l'utilisateur est un admin
const adminOnly = checkRole(['admin']);

// Utiliser les routes utilisateur
router.use('/users', userRoutes);

// Middleware pour protéger toutes les routes admin
router.use(authenticateToken, checkRole(['admin']));

// Route pour récupérer les statistiques du tableau de bord
router.get('/summary', async (req, res) => {
  try {
    console.log('📊 Récupération des statistiques du tableau de bord');
    
    // Récupérer le nombre total d'élèves
    const totalStudents = await prisma.student.count({
      where: { isActive: true }
    });
    
    // Récupérer le nombre total d'enseignants
    const totalTeachers = await prisma.user.count({
      where: { role: 'teacher' }
    });
    
    // Récupérer le nombre total de classes - À ajuster en fonction de votre modèle réel
    // Si vous n'avez pas encore de modèle de classe, utilisez une valeur par défaut
    let totalClasses = 0;
    try {
      // Essayez de compter les classes si le modèle existe
      totalClasses = await prisma.student.groupBy({
        by: ['class'],
      }).then(groups => groups.length);
    } catch (error) {
      console.log('⚠️ Impossible de compter les classes:', error);
      // Utiliser les classes uniques des étudiants comme fallback
      const uniqueClasses = await prisma.student.findMany({
        select: { class: true },
        distinct: ['class'],
      });
      totalClasses = uniqueClasses.length;
    }
    
    // Taux d'assiduité - À remplacer par des données réelles quand disponibles
    const attendanceRate = 0.94; // 94% de présence (simulé pour le moment)
    
    // Récupérer le montant total des paiements - À ajuster en fonction de votre modèle réel
    // Si vous n'avez pas encore de modèle de paiement, utilisez une valeur par défaut
    const totalPayments = 125000; // 125 000 $ (simulé pour le moment)
    
    // Performance académique moyenne - À calculer à partir de données réelles si disponibles
    const averagePerformance = 78.5; // 78.5% (simulé pour le moment)
    
    // Récupérer le nombre de parents en attente
    const pendingParents = await prisma.user.count({
      where: { 
        role: 'pending_parent',
        status: 'en_attente'
      }
    });
    
    // Récupérer le nombre total d'utilisateurs actifs
    const activeUsers = await prisma.user.count({
      where: { status: 'active' }
    });
    
    // Récupérer la répartition des utilisateurs par rôle
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });
    
    // Répartition des utilisateurs par rôle dans un format plus facile à utiliser
    const roleDistribution = {};
    usersByRole.forEach(item => {
      roleDistribution[item.role] = item._count.role;
    });
    
    // Récupérer la répartition des utilisateurs par statut
    const usersByStatus = await prisma.user.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });
    
    // Répartition des utilisateurs par statut dans un format plus facile à utiliser
    const statusDistribution = {};
    usersByStatus.forEach(item => {
      statusDistribution[item.status] = item._count.status;
    });
    
    // Récupérer les utilisateurs récemment créés (limité à 5)
    const recentUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalClasses,
        attendanceRate,
        totalPayments,
        averagePerformance,
        pendingParents,
        activeUsers,
        roleDistribution,
        statusDistribution,
        recentUsers
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 