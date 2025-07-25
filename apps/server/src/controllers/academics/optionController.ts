import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une option
const optionSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
});

// Récupérer toutes les options
export const getAllOptions = async (req: Request, res: Response) => {
  try {
    const options = await prisma.option.findMany({
      orderBy: { nom: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des options:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des options',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer une option par son ID
export const getOptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const option = await prisma.option.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de l'option ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'option',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Créer une nouvelle option
export const createOption = async (req: Request, res: Response) => {
  try {
    // Validation des données
    const validationResult = optionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si une option avec le même nom existe déjà
    const existingOption = await prisma.option.findUnique({
      where: { nom: validationResult.data.nom },
    });

    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: 'Une option avec ce nom existe déjà',
      });
    }

    // Créer l'option
    const option = await prisma.option.create({
      data: validationResult.data,
    });

    return res.status(201).json({
      success: true,
      message: 'Option créée avec succès',
      data: option,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'option:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'option',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mettre à jour une option
export const updateOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = optionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si l'option existe
    const option = await prisma.option.findUnique({
      where: { id },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option non trouvée',
      });
    }

    // Vérifier si une autre option avec le même nom existe déjà
    if (validationResult.data.nom !== option.nom) {
      const existingOption = await prisma.option.findUnique({
        where: { nom: validationResult.data.nom },
      });

      if (existingOption) {
        return res.status(400).json({
          success: false,
          message: 'Une option avec ce nom existe déjà',
        });
      }
    }

    // Mettre à jour l'option
    const updatedOption = await prisma.option.update({
      where: { id },
      data: validationResult.data,
    });

    return res.status(200).json({
      success: true,
      message: 'Option mise à jour avec succès',
      data: updatedOption,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de l'option ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'option',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Supprimer une option
export const deleteOption = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si l'option existe
    const option = await prisma.option.findUnique({
      where: { id },
      include: { classes: true },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: 'Option non trouvée',
      });
    }

    // Vérifier s'il y a des classes associées
    if (option.classes.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette option car elle est associée à des classes',
      });
    }

    // Supprimer l'option
    await prisma.option.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Option supprimée avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de l'option ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'option',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 