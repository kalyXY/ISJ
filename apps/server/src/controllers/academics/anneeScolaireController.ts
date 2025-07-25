import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une année scolaire
const anneeScolaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  debut: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La date de début doit être une date valide',
  }),
  fin: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La date de fin doit être une date valide',
  }),
  actuelle: z.boolean().optional().default(false),
});

// Récupérer toutes les années scolaires
export const getAllAnneesScolaires = async (req: Request, res: Response) => {
  try {
    const anneesScolaires = await prisma.anneeScolaire.findMany({
      orderBy: { debut: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: anneesScolaires,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des années scolaires:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des années scolaires',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer l'année scolaire actuelle
export const getAnneeScolareCourante = async (req: Request, res: Response) => {
  try {
    const anneeScolaire = await prisma.anneeScolaire.findFirst({
      where: { actuelle: true },
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Aucune année scolaire courante définie',
      });
    }

    return res.status(200).json({
      success: true,
      data: anneeScolaire,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'année scolaire courante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'année scolaire courante',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer une année scolaire par son ID
export const getAnneeScolaireById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id },
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Année scolaire non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: anneeScolaire,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de l'année scolaire ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'année scolaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Créer une nouvelle année scolaire
export const createAnneeScolaire = async (req: Request, res: Response) => {
  try {
    // Validation des données
    const validationResult = anneeScolaireSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    const { nom, debut, fin, actuelle } = validationResult.data;
    const debutDate = new Date(debut);
    const finDate = new Date(fin);

    // Vérifier que la date de début est avant la date de fin
    if (debutDate >= finDate) {
      return res.status(400).json({
        success: false,
        message: 'La date de début doit être antérieure à la date de fin',
      });
    }

    // Vérifier si une année scolaire avec le même nom existe déjà
    const existingAnneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { nom },
    });

    if (existingAnneeScolaire) {
      return res.status(400).json({
        success: false,
        message: 'Une année scolaire avec ce nom existe déjà',
      });
    }

    // Si cette année est définie comme actuelle, désactiver les autres
    if (actuelle) {
      await prisma.anneeScolaire.updateMany({
        where: { actuelle: true },
        data: { actuelle: false },
      });
    }

    // Créer l'année scolaire
    const anneeScolaire = await prisma.anneeScolaire.create({
      data: {
        nom,
        debut: debutDate,
        fin: finDate,
        actuelle: actuelle || false,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Année scolaire créée avec succès',
      data: anneeScolaire,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'année scolaire:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'année scolaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mettre à jour une année scolaire
export const updateAnneeScolaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = anneeScolaireSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si l'année scolaire existe
    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id },
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Année scolaire non trouvée',
      });
    }

    const { nom, debut, fin, actuelle } = validationResult.data;
    const debutDate = new Date(debut);
    const finDate = new Date(fin);

    // Vérifier que la date de début est avant la date de fin
    if (debutDate >= finDate) {
      return res.status(400).json({
        success: false,
        message: 'La date de début doit être antérieure à la date de fin',
      });
    }

    // Vérifier si une autre année scolaire avec le même nom existe déjà
    if (nom !== anneeScolaire.nom) {
      const existingAnneeScolaire = await prisma.anneeScolaire.findUnique({
        where: { nom },
      });

      if (existingAnneeScolaire) {
        return res.status(400).json({
          success: false,
          message: 'Une année scolaire avec ce nom existe déjà',
        });
      }
    }

    // Si cette année est définie comme actuelle, désactiver les autres
    if (actuelle) {
      await prisma.anneeScolaire.updateMany({
        where: {
          id: { not: id },
          actuelle: true,
        },
        data: { actuelle: false },
      });
    }

    // Mettre à jour l'année scolaire
    const updatedAnneeScolaire = await prisma.anneeScolaire.update({
      where: { id },
      data: {
        nom,
        debut: debutDate,
        fin: finDate,
        actuelle: actuelle || false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Année scolaire mise à jour avec succès',
      data: updatedAnneeScolaire,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de l'année scolaire ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'année scolaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Supprimer une année scolaire
export const deleteAnneeScolaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si l'année scolaire existe
    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id },
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Année scolaire non trouvée',
      });
    }

    // Vérifier s'il existe des classes associées à cette année scolaire
    const classeCount = await prisma.classe.count({
      where: { anneeScolaire: anneeScolaire.nom },
    });

    if (classeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette année scolaire car elle est associée à des classes',
      });
    }

    // Supprimer l'année scolaire
    await prisma.anneeScolaire.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Année scolaire supprimée avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de l'année scolaire ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'année scolaire',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Définir l'année scolaire actuelle
export const setCurrentAnneeScolaire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si l'année scolaire existe
    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id },
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Année scolaire non trouvée',
      });
    }

    // Désactiver toutes les autres années scolaires
    await prisma.anneeScolaire.updateMany({
      where: { id: { not: id } },
      data: { actuelle: false },
    });

    // Définir cette année scolaire comme actuelle
    await prisma.anneeScolaire.update({
      where: { id },
      data: { actuelle: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Année scolaire définie comme actuelle avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la définition de l'année scolaire ${req.params.id} comme actuelle:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la définition de l\'année scolaire comme actuelle',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 