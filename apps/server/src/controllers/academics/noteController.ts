import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';

// Schéma de validation pour la création et la mise à jour d'une note
const noteSchema = z.object({
  valeur: z.number().min(0, 'La note ne peut pas être négative').max(20, 'La note ne peut pas dépasser 20'),
  studentId: z.string().min(1, 'L\'élève est requis'),
  matiereId: z.string().min(1, 'La matière est requise'),
  periodeId: z.string().min(1, 'La période est requise'),
  typeEvaluation: z.enum(['note_normale', 'interrogation', 'examen', 'devoir']).optional(),
  coefficient: z.number().min(0.1, 'Le coefficient doit être au moins 0.1').max(5, 'Le coefficient ne peut pas dépasser 5').optional(),
  appreciation: z.string().max(500, 'L\'appréciation ne peut pas dépasser 500 caractères').optional()
});

// Fonction utilitaire pour vérifier les paramètres de l'école
async function getParametresEcole() {
  const parametres = await prisma.parametreEcole.findMany();
  const config: Record<string, any> = {};
  
  parametres.forEach(param => {
    switch (param.type) {
      case 'number':
        config[param.cle] = parseFloat(param.valeur);
        break;
      case 'boolean':
        config[param.cle] = param.valeur === 'true';
        break;
      default:
        config[param.cle] = param.valeur;
    }
  });

  return {
    noteMin: config.note_min || 0,
    noteMax: config.note_max || 20,
    seuilReussite: config.seuil_reussite || 10
  };
}

// Vérifier si un enseignant peut modifier les notes d'une matière
async function verifierPermissionEnseignant(enseignantId: string, matiereId: string): Promise<boolean> {
  const enseignantMatiere = await prisma.enseignantMatiere.findFirst({
    where: {
      enseignantId,
      matiereId
    }
  });

  return !!enseignantMatiere;
}

// Récupérer toutes les notes avec filtres
export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const { 
      classeId, 
      matiereId, 
      periodeId, 
      studentId, 
      enseignantId,
      isValidated 
    } = req.query;

    const whereClause: any = {};
    
    if (classeId) {
      whereClause.student = { classeId: classeId as string };
    }
    if (matiereId) {
      whereClause.matiereId = matiereId as string;
    }
    if (periodeId) {
      whereClause.periodeId = periodeId as string;
    }
    if (studentId) {
      whereClause.studentId = studentId as string;
    }
    if (enseignantId) {
      whereClause.enseignantId = enseignantId as string;
    }
    if (isValidated !== undefined) {
      whereClause.isValidated = isValidated === 'true';
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true
          }
        },
        matiere: {
          select: {
            id: true,
            nom: true
          }
        },
        periode: {
          select: {
            id: true,
            nom: true,
            type: true,
            isValidated: true
          }
        },
        enseignant: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
        { matiere: { nom: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: notes,
      message: 'Notes récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes'
    });
  }
};

// Récupérer les notes par classe et période
export const getNotesByClasseAndPeriode = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId } = req.params;

    const notes = await prisma.note.findMany({
      where: {
        student: { classeId },
        periodeId
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true
          }
        },
        matiere: {
          select: {
            id: true,
            nom: true
          }
        },
        enseignant: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
        { matiere: { nom: 'asc' } }
      ]
    });

    // Regrouper les notes par élève et matière
    const notesGroupees = notes.reduce((acc, note) => {
      const studentKey = `${note.studentId}`;
      if (!acc[studentKey]) {
        acc[studentKey] = {
          student: note.student,
          notes: {}
        };
      }
      
      const matiereKey = note.matiereId;
      if (!acc[studentKey].notes[matiereKey]) {
        acc[studentKey].notes[matiereKey] = {
          matiere: note.matiere,
          notes: []
        };
      }
      
      acc[studentKey].notes[matiereKey].notes.push({
        id: note.id,
        valeur: note.valeur,
        typeEvaluation: note.typeEvaluation,
        coefficient: note.coefficient,
        appreciation: note.appreciation,
        isValidated: note.isValidated,
        enseignant: note.enseignant,
        createdAt: note.createdAt
      });
      
      return acc;
    }, {} as any);

    res.json({
      success: true,
      data: Object.values(notesGroupees),
      message: 'Notes par classe et période récupérées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notes'
    });
  }
};

// Créer une nouvelle note
export const createNote = async (req: Request, res: Response) => {
  try {
    const validatedData = noteSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent créer des notes'
      });
    }

    // Vérifier que l'enseignant peut noter cette matière
    const peutNoter = await verifierPermissionEnseignant(enseignant.id, validatedData.matiereId);
    if (!peutNoter) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à noter cette matière'
      });
    }

    // Vérifier que la période n'est pas validée
    const periode = await prisma.periode.findUnique({
      where: { id: validatedData.periodeId }
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
        message: 'Impossible de créer une note pour une période validée'
      });
    }

    // Vérifier les paramètres de l'école
    const parametres = await getParametresEcole();
    if (validatedData.valeur < parametres.noteMin || validatedData.valeur > parametres.noteMax) {
      return res.status(400).json({
        success: false,
        message: `La note doit être comprise entre ${parametres.noteMin} et ${parametres.noteMax}`
      });
    }

    // Vérifier que l'élève existe et est dans une classe qui a cette matière
    const student = await prisma.student.findUnique({
      where: { id: validatedData.studentId },
      include: {
        classe: {
          include: {
            matieres: {
              where: { id: validatedData.matiereId }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    if (!student.classe || student.classe.matieres.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cette matière n\'est pas enseignée dans la classe de cet élève'
      });
    }

    const note = await prisma.note.create({
      data: {
        ...validatedData,
        enseignantId: enseignant.id
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true
          }
        },
        matiere: {
          select: {
            id: true,
            nom: true
          }
        },
        periode: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        },
        enseignant: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    // Créer un historique de modification
    await prisma.historiqueModification.create({
      data: {
        noteId: note.id,
        nouvelleValeur: note.valeur,
        userId,
        action: 'creation',
        commentaire: `Note créée: ${note.valeur}/20`
      }
    });

    res.status(201).json({
      success: true,
      data: note,
      message: 'Note créée avec succès'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.issues
      });
    }

    console.error('Erreur lors de la création de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la note'
    });
  }
};

// Mettre à jour une note
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = noteSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Récupérer la note existante
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: {
        periode: true,
        enseignant: true
      }
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée'
      });
    }

    // Vérifier que la période n'est pas validée
    if (existingNote.periode.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de modifier une note d\'une période validée'
      });
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent modifier des notes'
      });
    }

    // Vérifier que l'enseignant peut modifier cette note (soit il l'a créée, soit il enseigne cette matière)
    const peutModifier = existingNote.enseignantId === enseignant.id || 
                         await verifierPermissionEnseignant(enseignant.id, existingNote.matiereId);
    
    if (!peutModifier) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette note'
      });
    }

    // Vérifier les paramètres de l'école
    const parametres = await getParametresEcole();
    if (validatedData.valeur < parametres.noteMin || validatedData.valeur > parametres.noteMax) {
      return res.status(400).json({
        success: false,
        message: `La note doit être comprise entre ${parametres.noteMin} et ${parametres.noteMax}`
      });
    }

    const ancienneValeur = existingNote.valeur;

    const note = await prisma.note.update({
      where: { id },
      data: validatedData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            matricule: true
          }
        },
        matiere: {
          select: {
            id: true,
            nom: true
          }
        },
        periode: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        },
        enseignant: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    // Créer un historique de modification
    await prisma.historiqueModification.create({
      data: {
        noteId: note.id,
        ancienneValeur,
        nouvelleValeur: note.valeur,
        userId,
        action: 'modification',
        commentaire: `Note modifiée: ${ancienneValeur}/20 → ${note.valeur}/20`
      }
    });

    res.json({
      success: true,
      data: note,
      message: 'Note mise à jour avec succès'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: error.issues
      });
    }

    console.error('Erreur lors de la mise à jour de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la note'
    });
  }
};

// Supprimer une note
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Récupérer la note existante
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: {
        periode: true,
        enseignant: true
      }
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note non trouvée'
      });
    }

    // Vérifier que la période n'est pas validée
    if (existingNote.periode.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer une note d\'une période validée'
      });
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent supprimer des notes'
      });
    }

    // Vérifier que l'enseignant peut supprimer cette note
    const peutSupprimer = existingNote.enseignantId === enseignant.id || 
                          await verifierPermissionEnseignant(enseignant.id, existingNote.matiereId);
    
    if (!peutSupprimer) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à supprimer cette note'
      });
    }

    // Créer un historique avant suppression
    await prisma.historiqueModification.create({
      data: {
        noteId: existingNote.id,
        ancienneValeur: existingNote.valeur,
        userId,
        action: 'suppression',
        commentaire: `Note supprimée: ${existingNote.valeur}/20`
      }
    });

    await prisma.note.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Note supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la note:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la note'
    });
  }
};

// Calculer la moyenne d'un élève pour une période
export const getMoyenneEleve = async (req: Request, res: Response) => {
  try {
    const { studentId, periodeId } = req.params;

    const notes = await prisma.note.findMany({
      where: {
        studentId,
        periodeId,
        isValidated: true
      },
      include: {
        matiere: {
          select: {
            nom: true
          }
        }
      }
    });

    if (notes.length === 0) {
      return res.json({
        success: true,
        data: {
          moyenne: null,
          nombreNotes: 0,
          details: []
        },
        message: 'Aucune note validée trouvée pour cette période'
      });
    }

    // Calculer la moyenne pondérée par matière
    const notesByMatiere = notes.reduce((acc, note) => {
      const matiereId = note.matiereId;
      if (!acc[matiereId]) {
        acc[matiereId] = {
          nom: note.matiere.nom,
          notes: [],
          totalPoints: 0,
          totalCoefficients: 0
        };
      }
      
      acc[matiereId].notes.push({
        valeur: note.valeur,
        coefficient: note.coefficient
      });
      acc[matiereId].totalPoints += note.valeur * note.coefficient;
      acc[matiereId].totalCoefficients += note.coefficient;
      
      return acc;
    }, {} as any);

    // Calculer la moyenne par matière puis la moyenne générale
    let sommeNotes = 0;
    let nombreMatieres = 0;
    const detailsMatieres = [];

    for (const matiereId in notesByMatiere) {
      const matiere = notesByMatiere[matiereId];
      const moyenneMatiere = matiere.totalPoints / matiere.totalCoefficients;
      
      detailsMatieres.push({
        matiere: matiere.nom,
        moyenne: Math.round(moyenneMatiere * 100) / 100,
        nombreNotes: matiere.notes.length
      });
      
      sommeNotes += moyenneMatiere;
      nombreMatieres++;
    }

    const moyenneGenerale = Math.round((sommeNotes / nombreMatieres) * 100) / 100;

    res.json({
      success: true,
      data: {
        moyenne: moyenneGenerale,
        nombreNotes: notes.length,
        nombreMatieres,
        details: detailsMatieres
      },
      message: 'Moyenne calculée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du calcul de la moyenne:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de la moyenne'
    });
  }
};

// Récupérer l'historique des modifications d'une note
export const getHistoriqueNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const historique = await prisma.historiqueModification.findMany({
      where: { noteId: id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: historique,
      message: 'Historique récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};