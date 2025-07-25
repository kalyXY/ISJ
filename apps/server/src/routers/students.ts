import express from 'express';
import prisma from '../../prisma';
import { z } from 'zod';
import { isAuthenticated, isAdmin, isTeacher } from '../lib/authMiddleware';

const router = express.Router();

// Schéma de validation pour un élève
const studentSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  gender: z.enum(['M', 'F']).refine(val => val === 'M' || val === 'F', {
    message: 'Le genre doit être M ou F'
  }),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Format de date invalide'
  }),
  class: z.string().min(1, 'La classe est requise'),
  promotion: z.string().min(1, 'La promotion est requise'),
  matricule: z.string().min(3, 'Le matricule doit contenir au moins 3 caractères'),
  parentPhone: z.string().min(9, 'Le numéro de téléphone doit contenir au moins 9 chiffres'),
  isActive: z.boolean().optional().default(true),
});

// GET /api/students - Récupérer tous les élèves avec filtres et pagination
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      search = '', 
      class: className = '',
      promotion = '',
      isActive = ''
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    // Construction des filtres
    const filters: Record<string, any> = {};
    
    if (search) {
      filters.OR = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { matricule: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (className) {
      filters.class = className;
    }
    
    if (promotion) {
      filters.promotion = promotion;
    }
    
    if (isActive !== '') {
      filters.isActive = isActive === 'true';
    }

    // Récupération des élèves avec pagination
    const students = await prisma.student.findMany({
      where: filters,
      skip,
      take: limitNumber,
      orderBy: { lastName: 'asc' },
    });

    // Comptage du nombre total d'élèves pour la pagination
    const total = await prisma.student.count({ where: filters });

    // Récupération des classes et promotions pour les filtres
    const classes = await prisma.student.findMany({
      select: { class: true },
      distinct: ['class'],
      orderBy: { class: 'asc' }
    });
    
    const promotions = await prisma.student.findMany({
      select: { promotion: true },
      distinct: ['promotion'],
      orderBy: { promotion: 'asc' }
    });

    return res.status(200).json({
      students,
      pagination: {
        total,
        pages: Math.ceil(total / limitNumber),
        page: pageNumber,
        limit: limitNumber
      },
      filters: {
        classes: classes.map((c: { class: string }) => c.class),
        promotions: promotions.map((p: { promotion: string }) => p.promotion)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/students/:id - Récupérer un élève par son ID
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élève:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/students - Ajouter un nouvel élève
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    // Validation des données
    const validationResult = studentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: validationResult.error.format() 
      });
    }

    const data = validationResult.data;

    // Vérification de l'unicité du matricule
    const existingStudent = await prisma.student.findUnique({
      where: { matricule: data.matricule }
    });

    if (existingStudent) {
      return res.status(400).json({ message: 'Ce matricule existe déjà' });
    }

    // Création de l'élève
    const student = await prisma.student.create({
      data: {
        ...data,
        birthDate: new Date(data.birthDate)
      }
    });

    return res.status(201).json(student);
  } catch (error) {
    console.error('Erreur lors de la création de l\'élève:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/students/:id - Modifier un élève existant
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = studentSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: validationResult.error.format() 
      });
    }

    const data = validationResult.data;

    // Vérification que l'élève existe
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Vérification de l'unicité du matricule (sauf pour l'élève en cours de modification)
    if (data.matricule !== existingStudent.matricule) {
      const studentWithSameMatricule = await prisma.student.findUnique({
        where: { matricule: data.matricule }
      });

      if (studentWithSameMatricule) {
        return res.status(400).json({ message: 'Ce matricule existe déjà' });
      }
    }

    // Mise à jour de l'élève
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...data,
        birthDate: new Date(data.birthDate)
      }
    });

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'élève:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/students/:id - Supprimer un élève
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification que l'élève existe
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    });

    if (!existingStudent) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Suppression de l'élève
    await prisma.student.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Élève supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'élève:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 