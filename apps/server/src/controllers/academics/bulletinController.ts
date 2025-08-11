import type { Request, Response } from 'express';
import prisma from '../../../prisma';
import { z } from 'zod';
import { genererBulletinPDF, genererBulletinsClassePDF } from '../../../lib/pdfGenerator';

// Interface pour les données de bulletin
interface BulletinData {
  student: any;
  periode: any;
  classe: any;
  notes: any[];
  moyenneGenerale: number;
  rangClasse: number;
  statistiquesClasse: {
    moyenneClasse: number;
    meilleureNote: number;
    plusBasseNote: number;
    nombreEleves: number;
  };
}

// Calculer la moyenne d'un élève pour une période
async function calculerMoyenneEleve(studentId: string, periodeId: string): Promise<number | null> {
  const notes = await prisma.note.findMany({
    where: {
      studentId,
      periodeId,
      isValidated: true
    }
  });

  if (notes.length === 0) return null;

  // Calculer la moyenne pondérée par matière
  const notesByMatiere = notes.reduce((acc, note) => {
    const matiereId = note.matiereId;
    if (!acc[matiereId]) {
      acc[matiereId] = {
        totalPoints: 0,
        totalCoefficients: 0
      };
    }
    
    acc[matiereId].totalPoints += note.valeur * note.coefficient;
    acc[matiereId].totalCoefficients += note.coefficient;
    
    return acc;
  }, {} as any);

  // Calculer la moyenne par matière puis la moyenne générale
  let sommeNotes = 0;
  let nombreMatieres = 0;

  for (const matiereId in notesByMatiere) {
    const matiere = notesByMatiere[matiereId];
    const moyenneMatiere = matiere.totalPoints / matiere.totalCoefficients;
    sommeNotes += moyenneMatiere;
    nombreMatieres++;
  }

  return nombreMatieres > 0 ? Math.round((sommeNotes / nombreMatieres) * 100) / 100 : null;
}

// Calculer le classement dans la classe
async function calculerClassementClasse(classeId: string, periodeId: string): Promise<Array<{studentId: string, moyenne: number}>> {
  const students = await prisma.student.findMany({
    where: { 
      classeId,
      isActive: true
    },
    select: { id: true }
  });

  const moyennes = [];
  
  for (const student of students) {
    const moyenne = await calculerMoyenneEleve(student.id, periodeId);
    if (moyenne !== null) {
      moyennes.push({
        studentId: student.id,
        moyenne
      });
    }
  }

  // Trier par moyenne décroissante
  return moyennes.sort((a, b) => b.moyenne - a.moyenne);
}

// Générer les données d'un bulletin
async function genererDonneesBulletin(studentId: string, periodeId: string): Promise<any> {
  // Récupérer les informations de base
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      classe: {
        include: {
          section: true,
          option: true
        }
      }
    }
  });

  if (!student || !student.classe) {
    throw new Error('Élève ou classe non trouvé');
  }

  const periode = await prisma.periode.findUnique({
    where: { id: periodeId },
    include: {
      anneeScolaire: true
    }
  });

  if (!periode) {
    throw new Error('Période non trouvée');
  }

  // Vérifier que la période est validée
  if (!periode.isValidated) {
    throw new Error('La période doit être validée pour générer un bulletin');
  }

  // Récupérer toutes les notes de l'élève pour cette période
  const notes = await prisma.note.findMany({
    where: {
      studentId,
      periodeId,
      isValidated: true
    },
    include: {
      matiere: {
        select: {
          id: true,
          nom: true
        }
      },
      enseignant: {
        select: {
          nom: true
        }
      }
    },
    orderBy: {
      matiere: { nom: 'asc' }
    }
  });

  // Calculer la moyenne générale
  const moyenneGenerale = await calculerMoyenneEleve(studentId, periodeId);
  
  if (moyenneGenerale === null) {
    throw new Error('Impossible de calculer la moyenne : aucune note validée');
  }

  // Calculer le classement
  const classement = await calculerClassementClasse(student.classeId!, periodeId);
  const rangEleve = classement.findIndex(item => item.studentId === studentId) + 1;

  // Calculer les statistiques de la classe
  const moyennesClasse = classement.map(item => item.moyenne);
  const statistiquesClasse = {
    moyenneClasse: Math.round((moyennesClasse.reduce((sum, m) => sum + m, 0) / moyennesClasse.length) * 100) / 100,
    meilleureNote: Math.max(...moyennesClasse),
    plusBasseNote: Math.min(...moyennesClasse),
    nombreEleves: moyennesClasse.length
  };

  return {
    student,
    periode,
    classe: student.classe,
    notes,
    moyenneGenerale,
    rangClasse: rangEleve,
    statistiquesClasse
  };
}

// Récupérer tous les bulletins
export const getAllBulletins = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId, studentId } = req.query;

    const whereClause: any = {};
    if (classeId) whereClause.classeId = classeId as string;
    if (periodeId) whereClause.periodeId = periodeId as string;
    if (studentId) whereClause.studentId = studentId as string;

    const bulletins = await prisma.bulletin.findMany({
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
        periode: {
          select: {
            id: true,
            nom: true,
            type: true
          }
        },
        classe: {
          select: {
            id: true,
            nom: true
          }
        }
      },
      orderBy: [
        { periode: { dateDebut: 'desc' } },
        { student: { lastName: 'asc' } }
      ]
    });

    res.json({
      success: true,
      data: bulletins,
      message: 'Bulletins récupérés avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des bulletins:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des bulletins'
    });
  }
};

// Générer un bulletin pour un élève
export const genererBulletin = async (req: Request, res: Response) => {
  try {
    const { studentId, periodeId } = req.params;
    const { appreciationGenerale } = req.body;

    try {
      const donneesBulletin = await genererDonneesBulletin(studentId, periodeId);
      
      // Vérifier si un bulletin existe déjà
      let bulletin = await prisma.bulletin.findUnique({
        where: {
          studentId_periodeId: {
            studentId,
            periodeId
          }
        }
      });

      if (bulletin) {
        // Mettre à jour le bulletin existant
        bulletin = await prisma.bulletin.update({
          where: { id: bulletin.id },
          data: {
            moyenneGenerale: donneesBulletin.moyenneGenerale,
            rangClasse: donneesBulletin.rangClasse,
            appreciationGenerale: appreciationGenerale || bulletin.appreciationGenerale,
            isGenerated: true,
            dateGeneration: new Date()
          }
        });
      } else {
        // Créer un nouveau bulletin
        bulletin = await prisma.bulletin.create({
          data: {
            studentId,
            periodeId,
            classeId: donneesBulletin.classe.id,
            moyenneGenerale: donneesBulletin.moyenneGenerale,
            rangClasse: donneesBulletin.rangClasse,
            appreciationGenerale,
            isGenerated: true,
            dateGeneration: new Date()
          }
        });
      }

      res.json({
        success: true,
        data: {
          bulletin,
          details: donneesBulletin
        },
        message: 'Bulletin généré avec succès'
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Erreur lors de la génération du bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du bulletin'
    });
  }
};

// Générer tous les bulletins d'une classe pour une période
export const genererBulletinsClasse = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId } = req.params;

    // Vérifier que la période est validée
    const periode = await prisma.periode.findUnique({
      where: { id: periodeId }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    if (!periode.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'La période doit être validée pour générer les bulletins'
      });
    }

    // Récupérer tous les élèves actifs de la classe
    const students = await prisma.student.findMany({
      where: {
        classeId,
        isActive: true
      }
    });

    const bulletinsGeneres = [];
    const erreurs = [];

    // Générer un bulletin pour chaque élève
    for (const student of students) {
      try {
        const donneesBulletin = await genererDonneesBulletin(student.id, periodeId);
        
        // Vérifier si un bulletin existe déjà
        let bulletin = await prisma.bulletin.findUnique({
          where: {
            studentId_periodeId: {
              studentId: student.id,
              periodeId
            }
          }
        });

        if (bulletin) {
          // Mettre à jour le bulletin existant
          bulletin = await prisma.bulletin.update({
            where: { id: bulletin.id },
            data: {
              moyenneGenerale: donneesBulletin.moyenneGenerale,
              rangClasse: donneesBulletin.rangClasse,
              isGenerated: true,
              dateGeneration: new Date()
            }
          });
        } else {
          // Créer un nouveau bulletin
          bulletin = await prisma.bulletin.create({
            data: {
              studentId: student.id,
              periodeId,
              classeId,
              moyenneGenerale: donneesBulletin.moyenneGenerale,
              rangClasse: donneesBulletin.rangClasse,
              isGenerated: true,
              dateGeneration: new Date()
            }
          });
        }

        bulletinsGeneres.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          bulletinId: bulletin.id,
          moyenne: donneesBulletin.moyenneGenerale,
          rang: donneesBulletin.rangClasse
        });
      } catch (error: any) {
        erreurs.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          erreur: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        bulletinsGeneres,
        erreurs,
        totalEleves: students.length,
        bulletinsReussis: bulletinsGeneres.length,
        bulletinsEchoues: erreurs.length
      },
      message: `${bulletinsGeneres.length} bulletins générés avec succès sur ${students.length} élèves`
    });
  } catch (error) {
    console.error('Erreur lors de la génération des bulletins de classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des bulletins de classe'
    });
  }
};

// Récupérer les détails d'un bulletin
export const getBulletinDetails = async (req: Request, res: Response) => {
  try {
    const { studentId, periodeId } = req.params;

    const donneesBulletin = await genererDonneesBulletin(studentId, periodeId);

    // Récupérer le bulletin s'il existe
    const bulletin = await prisma.bulletin.findUnique({
      where: {
        studentId_periodeId: {
          studentId,
          periodeId
        }
      }
    });

    res.json({
      success: true,
      data: {
        bulletin,
        details: donneesBulletin
      },
      message: 'Détails du bulletin récupérés avec succès'
    });
  } catch (error: any) {
    if (error.message.includes('non trouvé') || error.message.includes('validée')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.error('Erreur lors de la récupération des détails du bulletin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails du bulletin'
    });
  }
};

// Mettre à jour l'appréciation générale d'un bulletin
export const updateAppreciationBulletin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { appreciationGenerale } = req.body;

    const bulletin = await prisma.bulletin.findUnique({
      where: { id }
    });

    if (!bulletin) {
      return res.status(404).json({
        success: false,
        message: 'Bulletin non trouvé'
      });
    }

    const bulletinUpdate = await prisma.bulletin.update({
      where: { id },
      data: { appreciationGenerale },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        periode: {
          select: {
            nom: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: bulletinUpdate,
      message: 'Appréciation mise à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'appréciation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'appréciation'
    });
  }
};

// Récupérer les statistiques d'une classe pour une période
export const getStatistiquesClasse = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId } = req.params;

    // Vérifier que la classe et la période existent
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        section: true,
        option: true
      }
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    const periode = await prisma.periode.findUnique({
      where: { id: periodeId }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    // Calculer les moyennes de tous les élèves
    const classement = await calculerClassementClasse(classeId, periodeId);

    if (classement.length === 0) {
      return res.json({
        success: true,
        data: {
          classe,
          periode,
          statistiques: null
        },
        message: 'Aucune note validée trouvée pour cette classe et période'
      });
    }

    const moyennes = classement.map(item => item.moyenne);
    
    // Calculer les statistiques
    const statistiques = {
      nombreEleves: moyennes.length,
      moyenneClasse: Math.round((moyennes.reduce((sum, m) => sum + m, 0) / moyennes.length) * 100) / 100,
      meilleureNote: Math.max(...moyennes),
      plusBasseNote: Math.min(...moyennes),
      mediane: moyennes.length % 2 === 0 
        ? (moyennes[Math.floor(moyennes.length / 2) - 1] + moyennes[Math.floor(moyennes.length / 2)]) / 2
        : moyennes[Math.floor(moyennes.length / 2)],
      
      // Répartition par tranches de notes
      repartition: {
        excellent: moyennes.filter(m => m >= 16).length, // 16-20
        tresBien: moyennes.filter(m => m >= 14 && m < 16).length, // 14-16
        bien: moyennes.filter(m => m >= 12 && m < 14).length, // 12-14
        assezBien: moyennes.filter(m => m >= 10 && m < 12).length, // 10-12
        insuffisant: moyennes.filter(m => m < 10).length // < 10
      },

      // Classement détaillé (sera résolu plus tard)
      classement: [] as any[]
    };

    // Construire le classement détaillé
    const classementDetaille = [];
    for (let i = 0; i < classement.length; i++) {
      const item = classement[i];
      const student = await prisma.student.findUnique({
        where: { id: item.studentId },
        select: {
          firstName: true,
          lastName: true,
          matricule: true
        }
      });

      classementDetaille.push({
        rang: i + 1,
        student,
        moyenne: item.moyenne
      });
    }
    statistiques.classement = classementDetaille;

    res.json({
      success: true,
      data: {
        classe,
        periode,
        statistiques
      },
      message: 'Statistiques calculées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques'
    });
  }
};

// Récupérer les statistiques par matière pour une classe et période
export const getStatistiquesMatiere = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId } = req.params;
    const { matiereId } = req.query;

    let whereClause: any = {
      student: { classeId },
      periodeId,
      isValidated: true
    };

    if (matiereId) {
      whereClause.matiereId = matiereId as string;
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        matiere: {
          select: {
            id: true,
            nom: true
          }
        },
        student: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Regrouper par matière
    const notesByMatiere = notes.reduce((acc, note) => {
      const matiereKey = note.matiereId;
      if (!acc[matiereKey]) {
        acc[matiereKey] = {
          matiere: note.matiere,
          notes: []
        };
      }
      acc[matiereKey].notes.push(note);
      return acc;
    }, {} as any);

    // Calculer les statistiques pour chaque matière
    const statistiques = Object.values(notesByMatiere).map((matiereData: any) => {
      const valeurs = matiereData.notes.map((n: any) => n.valeur);
      
      return {
        matiere: matiereData.matiere,
        nombreNotes: valeurs.length,
        moyenne: Math.round((valeurs.reduce((sum: number, v: number) => sum + v, 0) / valeurs.length) * 100) / 100,
        meilleureNote: Math.max(...valeurs),
        plusBasseNote: Math.min(...valeurs),
        repartition: {
          excellent: valeurs.filter((v: number) => v >= 16).length,
          tresBien: valeurs.filter((v: number) => v >= 14 && v < 16).length,
          bien: valeurs.filter((v: number) => v >= 12 && v < 14).length,
          assezBien: valeurs.filter((v: number) => v >= 10 && v < 12).length,
          insuffisant: valeurs.filter((v: number) => v < 10).length
        }
      };
    });

    res.json({
      success: true,
      data: statistiques,
      message: 'Statistiques par matière calculées avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques par matière:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques par matière'
    });
  }
};

// Télécharger le bulletin PDF d'un élève
export const telechargerBulletinPDF = async (req: Request, res: Response) => {
  try {
    const { studentId, periodeId } = req.params;

    try {
      const donneesBulletin = await genererDonneesBulletin(studentId, periodeId);
      
      // Récupérer l'appréciation du bulletin s'il existe
      const bulletin = await prisma.bulletin.findUnique({
        where: {
          studentId_periodeId: {
            studentId,
            periodeId
          }
        }
      });

      const donneesAvecAppreciation = {
        ...donneesBulletin,
        appreciation: bulletin?.appreciationGenerale
      };

      const pdfBuffer = await genererBulletinPDF(donneesAvecAppreciation);

      // Définir les en-têtes pour le téléchargement
      const filename = `bulletin_${donneesBulletin.student.firstName}_${donneesBulletin.student.lastName}_${donneesBulletin.periode.nom.replace(/\s+/g, '_')}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Erreur lors du téléchargement du bulletin PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du bulletin PDF'
    });
  }
};

// Télécharger tous les bulletins d'une classe en PDF
export const telechargerBulletinsClassePDF = async (req: Request, res: Response) => {
  try {
    const { classeId, periodeId } = req.params;

    // Vérifier que la période est validée
    const periode = await prisma.periode.findUnique({
      where: { id: periodeId },
      include: { anneeScolaire: true }
    });

    if (!periode) {
      return res.status(404).json({
        success: false,
        message: 'Période non trouvée'
      });
    }

    if (!periode.isValidated) {
      return res.status(400).json({
        success: false,
        message: 'La période doit être validée pour télécharger les bulletins'
      });
    }

    // Récupérer la classe
    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        section: true,
        option: true
      }
    });

    if (!classe) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Récupérer tous les élèves actifs de la classe
    const students = await prisma.student.findMany({
      where: {
        classeId,
        isActive: true
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    });

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun élève trouvé dans cette classe'
      });
    }

    const bulletinsData = [];
    const erreurs = [];

    // Générer les données pour chaque élève
    for (const student of students) {
      try {
        const donneesBulletin = await genererDonneesBulletin(student.id, periodeId);
        
        // Récupérer l'appréciation du bulletin s'il existe
        const bulletin = await prisma.bulletin.findUnique({
          where: {
            studentId_periodeId: {
              studentId: student.id,
              periodeId
            }
          }
        });

        bulletinsData.push({
          ...donneesBulletin,
          appreciation: bulletin?.appreciationGenerale
        });
      } catch (error: any) {
        erreurs.push({
          student: `${student.firstName} ${student.lastName}`,
          erreur: error.message
        });
      }
    }

    if (bulletinsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun bulletin valide trouvé pour cette classe',
        erreurs
      });
    }

    const pdfBuffer = await genererBulletinsClassePDF(bulletinsData);

    // Définir les en-têtes pour le téléchargement
    const filename = `bulletins_classe_${classe.nom.replace(/\s+/g, '_')}_${periode.nom.replace(/\s+/g, '_')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur lors du téléchargement des bulletins de classe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement des bulletins de classe'
    });
  }
};