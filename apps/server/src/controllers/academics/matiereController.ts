import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une matière
const matiereSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  classeId: z.string().min(1, 'La classe est requise'),
});

// Récupérer toutes les matières
export const getAllMatieres = async (req: Request, res: Response) => {
  try {
    const matieres = await prisma.matiere.findMany({
      include: {
        classe: {
          include: {
            section: true,
            option: true
          }
        }
      },
      orderBy: { nom: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: matieres,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des matières:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matières',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer les matières par classe
export const getMatieresByClasse = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;

    // Vérifier si la classe existe
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée',
      });
    }

    const matieres = await prisma.matiere.findMany({
      where: { classeId },
      orderBy: { nom: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: matieres,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération des matières pour la classe ${req.params.classeId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matières pour cette classe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer une matière par son ID
export const getMatiereById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const matiere = await prisma.matiere.findUnique({
      where: { id },
      include: {
        classe: {
          include: {
            section: true,
            option: true
          }
        }
      },
    });

    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: matiere,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de la matière ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la matière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Créer une nouvelle matière
export const createMatiere = async (req: Request, res: Response) => {
  try {
    // Validation des données
    const validationResult = matiereSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si la classe existe
    const classe = await prisma.classe.findUnique({
      where: { id: validationResult.data.classeId },
    });

    if (!classe) {
      return res.status(400).json({
        success: false,
        message: 'La classe spécifiée n\'existe pas',
      });
    }

    // Vérifier si une matière avec le même nom existe déjà dans cette classe
    const existingMatiere = await prisma.matiere.findFirst({
      where: {
        nom: validationResult.data.nom,
        classeId: validationResult.data.classeId
      },
    });

    if (existingMatiere) {
      return res.status(400).json({
        success: false,
        message: 'Une matière avec ce nom existe déjà dans cette classe',
      });
    }

    // Créer la matière
    const matiere = await prisma.matiere.create({
      data: validationResult.data,
      include: {
        classe: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Matière créée avec succès',
      data: matiere,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la matière:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la matière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mettre à jour une matière
export const updateMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = matiereSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si la matière existe
    const matiere = await prisma.matiere.findUnique({
      where: { id },
    });

    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée',
      });
    }

    // Vérifier si la classe existe
    const classe = await prisma.classe.findUnique({
      where: { id: validationResult.data.classeId },
    });

    if (!classe) {
      return res.status(400).json({
        success: false,
        message: 'La classe spécifiée n\'existe pas',
      });
    }

    // Vérifier si une autre matière avec le même nom existe déjà dans cette classe
    if (validationResult.data.nom !== matiere.nom || validationResult.data.classeId !== matiere.classeId) {
      const existingMatiere = await prisma.matiere.findFirst({
        where: {
          nom: validationResult.data.nom,
          classeId: validationResult.data.classeId,
          NOT: { id }
        },
      });

      if (existingMatiere) {
        return res.status(400).json({
          success: false,
          message: 'Une matière avec ce nom existe déjà dans cette classe',
        });
      }
    }

    // Mettre à jour la matière
    const updatedMatiere = await prisma.matiere.update({
      where: { id },
      data: validationResult.data,
      include: {
        classe: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Matière mise à jour avec succès',
      data: updatedMatiere,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de la matière ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la matière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Supprimer une matière
export const deleteMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la matière existe
    const matiere = await prisma.matiere.findUnique({
      where: { id },
    });

    if (!matiere) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée',
      });
    }

    // Supprimer la matière
    await prisma.matiere.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Matière supprimée avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de la matière ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la matière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 