import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une période
const periodeSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['trimestre', 'semestre']),
  dateDebut: z.string().transform((str) => new Date(str)),
  dateFin: z.string().transform((str) => new Date(str)),
  anneeScolaireId: z.string().min(1, 'L\'année scolaire est requise'),
  isActive: z.boolean().optional()
}).refine((data) => {
  return data.dateDebut < data.dateFin;
}, {
  message: 'La date de début doit être antérieure à la date de fin',
  path: ['dateFin']
});

// Récupérer toutes les périodes
export const getAllPeriodes = async (req: Request, res: Response) => {
  try {
    const { anneeScolaireId } = req.query;
    
    const whereClause: any = {};
    if (anneeScolaireId) {
      whereClause.anneeScolaireId = anneeScolaireId as string;
    }

    const periodes = await prisma.periode.findMany({
      where: whereClause,
      include: {
        anneeScolaire: true,
        _count: {
          select: {
            notes: true,
            bulletins: true
          }
        }
      },
      orderBy: [
        { anneeScolaire: { debut: 'desc' } },
        { dateDebut: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: periodes,
      message: 'Périodes récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des périodes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des périodes'
    });
  }
};

// Récupérer une période par ID
export const getPeriodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        anneeScolaire: true,
        _count: {
          select: {
            notes: true,
            bulletins: true
          }
        }
      }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    res.json({
      success: true,
      data: periode,
      message: 'Période récupérée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la période'
    });
  }
};

// Créer une nouvelle période
export const createPeriode = async (req: Request, res: Response) => {
  try {
    const validatedData = periodeSchema.parse(req.body);

    // Vérifier que l'année scolaire existe
    const anneeScolaire = await prisma.anneeScolaire.findUnique({
      where: { id: validatedData.anneeScolaireId }
    });

    if (!anneeScolaire) {
      return res.status(404).json({
        success: false,
        message: 'Année scolaire non trouvée'
      });
    }

    // Vérifier qu'il n'y a pas de chevauchement de dates avec d'autres périodes
    const chevauchement = await prisma.periode.findFirst({
      where: {
        anneeScolaireId: validatedData.anneeScolaireId,
        OR: [
          {
            AND: [
              { dateDebut: { lte: validatedData.dateDebut } },
              { dateFin: { gte: validatedData.dateDebut } }
            ]
          },
          {
            AND: [
              { dateDebut: { lte: validatedData.dateFin } },
              { dateFin: { gte: validatedData.dateFin } }
            ]
          },
          {
            AND: [
              { dateDebut: { gte: validatedData.dateDebut } },
              { dateFin: { lte: validatedData.dateFin } }
            ]
          }
        ]
      }
    });

    if (chevauchement) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de cette période chevauchent avec une période existante'
      });
    }

    const periode = await prisma.periode.create({
      data: validatedData,
      include: {
        anneeScolaire: true
      }
    });

    res.status(201).json({
      success: true,
      data: periode,
      message: 'Période créée avec succès'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.issues
      });
    }

    console.error('Erreur lors de la création de la période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la période'
    });
  }
};

// Mettre à jour une période
export const updatePeriode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = periodeSchema.parse(req.body);

    // Vérifier que la période existe
    const existingPeriode = await prisma.periode.findUnique({
      where: { id },
      include: { _count: { select: { notes: true } } }
    });

    if (!existingPeriode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    // Si la période est validée et contient des notes, interdire la modification des dates
    if (existingPeriode.isValidated && existingPeriode._count.notes > 0) {
      const dateChange = 
        validatedData.dateDebut.getTime() !== existingPeriode.dateDebut.getTime() ||
        validatedData.dateFin.getTime() !== existingPeriode.dateFin.getTime();

      if (dateChange) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de modifier les dates d\'une période validée contenant des notes'
        });
      }
    }

    // Vérifier qu'il n'y a pas de chevauchement avec d'autres périodes
    const chevauchement = await prisma.periode.findFirst({
      where: {
        id: { not: id },
        anneeScolaireId: validatedData.anneeScolaireId,
        OR: [
          {
            AND: [
              { dateDebut: { lte: validatedData.dateDebut } },
              { dateFin: { gte: validatedData.dateDebut } }
            ]
          },
          {
            AND: [
              { dateDebut: { lte: validatedData.dateFin } },
              { dateFin: { gte: validatedData.dateFin } }
            ]
          },
          {
            AND: [
              { dateDebut: { gte: validatedData.dateDebut } },
              { dateFin: { lte: validatedData.dateFin } }
            ]
          }
        ]
      }
    });

    if (chevauchement) {
      return res.status(400).json({
        success: false,
        message: 'Les dates de cette période chevauchent avec une période existante'
      });
    }

    const periode = await prisma.periode.update({
      where: { id },
      data: validatedData,
      include: {
        anneeScolaire: true
      }
    });

    res.json({
      success: true,
      data: periode,
      message: 'Période mise à jour avec succès'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.issues
      });
    }

    console.error('Erreur lors de la mise à jour de la période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la période'
    });
  }
};

// Supprimer une période
export const deletePeriode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            notes: true,
            bulletins: true
          }
        }
      }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    // Interdire la suppression si la période contient des notes ou des bulletins
    if (periode._count.notes > 0 || periode._count.bulletins > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une période contenant des notes ou des bulletins'
      });
    }

    await prisma.periode.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Période supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la période'
    });
  }
};

// Valider une période (verrouiller les notes)
export const validatePeriode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const periode = await prisma.periode.findUnique({
      where: { id },
      include: {
        _count: { select: { notes: true } }
      }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    if (periode.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'Cette période est déjà validée'
      });
    }

    // Valider toutes les notes de la période
    await prisma.$transaction(async (tx) => {
      await tx.note.updateMany({
        where: { periodeId: id },
        data: { 
          isValidated: true,
          dateValidation: new Date()
        }
      });

      await tx.periode.update({
        where: { id },
        data: { isValidated: true }
      });
    });

    res.json({
      success: true,
      message: 'Période validée avec succès. Toutes les notes sont maintenant verrouillées.'
    });
  } catch (error) {
    console.error('Erreur lors de la validation de la période:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la période'
    });
  }
};

// Récupérer les périodes actives
export const getPeriodesActives = async (req: Request, res: Response) => {
  try {
    const periodes = await prisma.periode.findMany({
      where: { 
        isActive: true,
        anneeScolaire: { actuelle: true }
      },
      include: {
        anneeScolaire: true
      },
      orderBy: { dateDebut: 'asc' }
    });

    res.json({
      success: true,
      data: periodes,
      message: 'Périodes actives récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des périodes actives:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des périodes actives'
    });
  }
};