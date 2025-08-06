import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../prisma';

// Liste tous les utilisateurs
export const getAllUsers = async (req: express.Request, res: express.Response) => {
  try {
    // Récupérer les paramètres de pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer les paramètres de filtrage
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    // Construire la requête
    const whereClause: any = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Exécuter les requêtes
    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          // Ne jamais renvoyer le mot de passe
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);
    
    return res.status(200).json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un utilisateur par son ID
export const getUserById = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        image: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouvel utilisateur
export const createUser = async (req: express.Request, res: express.Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Déterminer le statut initial en fonction du rôle
    let status = 'active';
    if (role === 'pending_parent') {
      status = 'en_attente';
    }
    
    // Créer l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        status,
        emailVerified: role !== 'pending_parent', // Marquer comme vérifié sauf pour les parents en attente
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    
    return res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: newUser,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, status, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }
    
    // Préparer les données à mettre à jour
    const updateData: any = {};
    
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    // Mettre à jour le mot de passe si fourni
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
    
    return res.status(200).json({
      message: 'Utilisateur mis à jour avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id },
    });
    
    return res.status(200).json({
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Valider un parent en attente
export const validateParent = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un parent en attente
    if (existingUser.role !== 'pending_parent') {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas un parent en attente de validation' });
    }
    
    // Mettre à jour le statut et le rôle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        status: 'active',
        role: 'parent',
        emailVerified: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        updatedAt: true,
      },
    });
    
    return res.status(200).json({
      message: 'Parent validé avec succès',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Erreur lors de la validation du parent:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}; 

// Fonction de test pour déboguer les utilisateurs
export const debugUsers = async (req: express.Request, res: express.Response) => {
  try {
    console.log('[debugUsers] Test de récupération des utilisateurs...');
    
    // Récupérer tous les utilisateurs avec leurs rôles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
      },
      orderBy: { role: 'asc' },
    });
    
    console.log('[debugUsers] Total utilisateurs:', allUsers.length);
    console.log('[debugUsers] Utilisateurs par rôle:', 
      allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );
    
    // Récupérer spécifiquement les utilisateurs avec rôle 'student'
    const etudiants = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });
    
    console.log('[debugUsers] Utilisateurs avec rôle student:', etudiants.length);
    console.log('[debugUsers] Étudiants:', etudiants);
    
    res.status(200).json({
      totalUsers: allUsers.length,
      usersByRole: allUsers.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      etudiants: etudiants,
    });
  } catch (error) {
    console.error('[debugUsers] Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 

// GET /api/users?role=student&notLinkedToStudent=true
export const getUnlinkedEtudiants = async (req: express.Request, res: express.Response) => {
  try {
    const { role, notLinkedToStudent } = req.query;
    
    if (role !== 'student' || notLinkedToStudent !== 'true') {
      return res.status(400).json({ message: 'Paramètres invalides' });
    }

    // Récupérer tous les utilisateurs avec le rôle student
    const allEtudiants = await prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    // Récupérer tous les userId déjà liés à un élève
    const students = await prisma.student.findMany({ 
      where: { userId: { not: null } }, 
      select: { userId: true } 
    });
    const linkedUserIds = students.map(s => s.userId).filter(Boolean);

    // Récupérer les utilisateurs non liés
    const users = await prisma.user.findMany({
      where: {
        role: 'student',
        id: { notIn: linkedUserIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
      orderBy: { lastName: 'asc' },
    });

    res.status(200).json({ users });
  } catch (error) {
    console.error('[getUnlinkedEtudiants] Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 