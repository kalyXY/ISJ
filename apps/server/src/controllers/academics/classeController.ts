import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une classe
const classeSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  salle: z.string().optional(),
  sectionId: z.string().optional().nullable(),
  optionId: z.string().optional().nullable(),
  anneeScolaire: z.string().min(1, 'L\'année scolaire est requise'),
  capaciteMaximale: z.number().min(1, 'La capacité maximale doit être d\'au moins 1').max(100, 'La capacité maximale ne peut pas dépasser 100').optional(),
  description: z.string().optional()
}).refine((data) => {
  // Pour les classes de 7ème et 8ème, section et option ne sont pas requises
  const isBasicClass = data.nom.includes('7ème') || data.nom.includes('8ème');
  
  if (!isBasicClass) {
    // Pour les autres classes (1ère à 4ème), la section est requise
    return data.sectionId && data.sectionId.length > 0;
  }
  
  return true;
}, {
  message: 'La section est requise pour les classes de 1ère à 4ème',
  path: ['sectionId']
});

// Fonction utilitaire pour vérifier la capacité d'une classe
async function checkClassCapacity(classeId: string): Promise<{ 
  canAdd: boolean; 
  currentCount: number; 
  maxCapacity: number; 
  message?: string;
}> {
  const classe = await prisma.classe.findUnique({
    where: { id: classeId },
    include: {
      students: { where: { isActive: true } }
    }
  });

  if (!classe) {
    return {
      canAdd: false,
      currentCount: 0,
      maxCapacity: 0,
      message: 'Classe non trouvée'
    };
  }

  const currentCount = classe.students.length;
  const maxCapacity = classe.capaciteMaximale || 30;

  return {
    canAdd: currentCount < maxCapacity,
    currentCount,
    maxCapacity,
    message: currentCount >= maxCapacity 
      ? `La classe a atteint sa capacité maximale (${maxCapacity} élèves)`
      : undefined
  };
}

// Récupérer toutes les classes
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.classe.findMany({
      include: {
        section: true,
        option: true,
        matieres: true,
        students: {
          where: { isActive: true }
        }
      },
      orderBy: { nom: 'asc' },
    });

    // Calculer le nombre d'étudiants actifs et les informations de capacité pour chaque classe
    const classesWithActiveCount = classes.map(classe => ({
      ...classe,
      _count: {
        students: classe.students.length,
        matieres: classe.matieres.length
      },
      studentsCount: classe.students.length,
      availableSpots: (classe.capaciteMaximale || 30) - classe.students.length,
      isAtCapacity: classe.students.length >= (classe.capaciteMaximale || 30),
      capacityPercentage: Math.round((classe.students.length / (classe.capaciteMaximale || 30)) * 100)
    }));

    return res.status(200).json({
      success: true,
      data: classesWithActiveCount,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des classes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Récupérer une classe par son ID
export const getClasseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classe = await prisma.classe.findUnique({
      where: { id },
      include: {
        section: true,
        option: true,
        matieres: true,
        students: true
      },
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée',
      });
    }

    return res.status(200).json({
      success: true,
      data: classe,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la récupération de la classe ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la classe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Créer une nouvelle classe
export const createClasse = async (req: Request, res: Response) => {
  try {
    // Validation des données
    const validationResult = classeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si la section existe (seulement si spécifiée)
    if (validationResult.data.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: validationResult.data.sectionId },
      });

      if (!section) {
        return res.status(400).json({
          success: false,
          message: 'La section spécifiée n\'existe pas',
        });
      }
    }

    // Vérifier si l'option existe (si spécifiée)
    if (validationResult.data.optionId) {
      const option = await prisma.option.findUnique({
        where: { id: validationResult.data.optionId },
      });

      if (!option) {
        return res.status(400).json({
          success: false,
          message: 'L\'option spécifiée n\'existe pas',
        });
      }
    }

    // Créer la classe
    const classe = await prisma.classe.create({
      data: {
        ...validationResult.data,
        capaciteMaximale: validationResult.data.capaciteMaximale || 30
      },
      include: {
        section: true,
        option: true,
        _count: {
          select: {
            students: {
              where: { isActive: true }
            }
          }
        }
      },
    });

    // Enrichir avec les informations de capacité
    const classeWithCapacity = {
      ...classe,
      studentsCount: classe._count.students,
      availableSpots: classe.capaciteMaximale - classe._count.students,
      isAtCapacity: false,
      capacityPercentage: 0
    };

    return res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: classeWithCapacity,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la classe:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la classe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Mettre à jour une classe
export const updateClasse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validation des données
    const validationResult = classeSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: validationResult.error.format(),
      });
    }

    // Vérifier si la classe existe
    const classe = await prisma.classe.findUnique({
      where: { id },
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée',
      });
    }

    // Vérifier si la section existe (seulement si spécifiée)
    if (validationResult.data.sectionId) {
      const section = await prisma.section.findUnique({
        where: { id: validationResult.data.sectionId },
      });

      if (!section) {
        return res.status(400).json({
          success: false,
          message: 'La section spécifiée n\'existe pas',
        });
      }
    }

    // Vérifier si l'option existe (si spécifiée)
    if (validationResult.data.optionId) {
      const option = await prisma.option.findUnique({
        where: { id: validationResult.data.optionId },
      });

      if (!option) {
        return res.status(400).json({
          success: false,
          message: 'L\'option spécifiée n\'existe pas',
        });
      }
    }

    // Mettre à jour la classe
    const updatedClasse = await prisma.classe.update({
      where: { id },
      data: validationResult.data,
      include: {
        section: true,
        option: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Classe mise à jour avec succès',
      data: updatedClasse,
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la mise à jour de la classe ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la classe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Supprimer une classe
export const deleteClasse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérifier si la classe existe
    const classe = await prisma.classe.findUnique({
      where: { id },
      include: { 
        matieres: true,
        students: true
      },
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée',
      });
    }

    // Vérifier s'il y a des matières ou des étudiants associés
    if (classe.matieres.length > 0 || classe.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer cette classe car elle est associée à des matières ou des étudiants',
      });
    }

    // Supprimer la classe
    await prisma.classe.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Classe supprimée avec succès',
    });
  } catch (error: any) {
    console.error(`❌ Erreur lors de la suppression de la classe ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la classe',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 

// Récupérer les classes filtrées par section et option
export const getClassesBySectionAndOption = async (req: Request, res: Response) => {
  try {
    const { sectionId, optionId } = req.query;
    
    const where: any = {};
    
    if (sectionId) {
      where.sectionId = sectionId as string;
    }
    
    if (optionId) {
      where.optionId = optionId as string;
    }
    
    const classes = await prisma.classe.findMany({
      where,
      include: {
        section: true,
        option: true,
        matieres: true,
        students: {
          where: { isActive: true }
        }
      },
      orderBy: { nom: 'asc' },
    });

    // Calculer le nombre d'étudiants actifs pour chaque classe
    const classesWithActiveCount = classes.map(classe => ({
      ...classe,
      _count: {
        students: classe.students.length,
        matieres: classe.matieres.length
      }
    }));

    return res.status(200).json({
      success: true,
      data: classesWithActiveCount,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des classes filtrées:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des classes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 

// Obtenir les statistiques des classes
export const getClassesStats = async (req: Request, res: Response) => {
  try {
    const anneeScolaire = req.query.anneeScolaire as string;
    
    const where = anneeScolaire ? { anneeScolaire } : {};

    const stats = await prisma.classe.aggregate({
      where,
      _sum: {
        capaciteMaximale: true
      },
      _count: {
        id: true
      }
    });

    const studentsCount = await prisma.student.count({
      where: {
        isActive: true,
        classe: anneeScolaire ? {
          anneeScolaire
        } : undefined
      }
    });

    const classesByCapacity = await prisma.classe.groupBy({
      by: ['capaciteMaximale'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        capaciteMaximale: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalClasses: stats._count.id,
        totalCapacity: stats._sum.capaciteMaximale || 0,
        totalStudents: studentsCount,
        availableSpots: (stats._sum.capaciteMaximale || 0) - studentsCount,
        occupancyPercentage: stats._sum.capaciteMaximale ? 
          Math.round((studentsCount / stats._sum.capaciteMaximale) * 100) : 0,
        classesByCapacity
      }
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des statistiques', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Retirer un élève d'une classe
export const removeStudentFromClasse = async (req: Request, res: Response) => {
  try {
    const { classeId, eleveId } = req.params;

    const eleve = await prisma.student.findUnique({
      where: { id: eleveId },
      include: { classe: true }
    });

    if (!eleve) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    if (eleve.classeId !== classeId) {
      return res.status(400).json({
        success: false,
        message: 'L\'élève n\'est pas dans cette classe'
      });
    }

    const updatedEleve = await prisma.student.update({
      where: { id: eleveId },
      data: {
        classeId: null,
        class: ''
      }
    });

    return res.status(200).json({
      success: true,
      data: updatedEleve,
      message: `Élève ${eleve.firstName} ${eleve.lastName} retiré de la classe ${eleve.classe?.nom}`
    });
  } catch (error: any) {
    console.error('❌ Erreur lors du retrait de l\'élève de la classe:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du retrait de l\'élève de la classe', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Fonction utilitaire pour vérifier la capacité (exportée pour utilisation dans d'autres contrôleurs)
export { checkClassCapacity }; 