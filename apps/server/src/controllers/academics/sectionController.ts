import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une section
const sectionSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
});

// Récupérer toutes les sections
export const getAllSections = async (req: Request, res: Response) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { nom: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des sections:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sections',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer une section par son ID
export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const section = await prisma.section.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de la section ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Créer une nouvelle section
export const createSection = async (req: Request, res: Response) => {
  try {
    // Validation des données
    const validationResult = sectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si une section avec le même nom existe déjà
    const existingSection = await prisma.section.findUnique({
      where: { nom: validationResult.data.nom },
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: 'Une section avec ce nom existe déjà',
      });
    }

    // Créer la section
    const section = await prisma.section.create({
      data: validationResult.data,
    });

    return res.status(201).json({
      success: true,
      message: 'Section créée avec succès',
      data: section,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la section:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mettre à jour une section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = sectionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si la section existe
    const section = await prisma.section.findUnique({
      where: { id },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée',
      });
    }

    // Vérifier si une autre section avec le même nom existe déjà
    if (validationResult.data.nom !== section.nom) {
      const existingSection = await prisma.section.findUnique({
        where: { nom: validationResult.data.nom },
      });

      if (existingSection) {
        return res.status(400).json({
          success: false,
          message: 'Une section avec ce nom existe déjà',
        });
      }
    }

    // Mettre à jour la section
    const updatedSection = await prisma.section.update({
      where: { id },
      data: validationResult.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Section mise à jour avec succès',
      data: updatedSection,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de la section ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Supprimer une section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la section existe
    const section = await prisma.section.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Section non trouvée',
      });
    }

    // Vérifier s'il y a des classes associées
    if (section.classes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette section car elle est associée à des classes',
      });
    }

    // Supprimer la section
    await prisma.section.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Section supprimée avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de la section ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la section',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 