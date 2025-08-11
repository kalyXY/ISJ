import type { Request, Response, NextFunction } from 'express';
import prisma from '../../prisma';

// Interface pour étendre Request avec l'utilisateur
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware pour vérifier qu'un enseignant peut modifier les notes d'une matière
export const checkEnseignantMatiere = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('👩‍🏫 Middleware checkEnseignantMatiere - Vérification des permissions enseignant');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Si l'utilisateur est admin, autoriser l'accès
    if (req.user.role === 'admin') {
      console.log('✅ Utilisateur admin - accès autorisé');
      return next();
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId: req.user.id }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent accéder à cette ressource'
      });
    }

    // Récupérer l'ID de la matière depuis les paramètres ou le body
    let matiereId = req.params.matiereId || req.body.matiereId;
    
    // Si on modifie une note existante, récupérer l'ID de la matière depuis la note
    if (!matiereId && req.params.id) {
      const note = await prisma.note.findUnique({
        where: { id: req.params.id },
        select: { matiereId: true }
      });
      matiereId = note?.matiereId;
    }

    if (!matiereId) {
      return res.status(400).json({
        success: false,
        message: 'Matière non spécifiée'
      });
    }

    // Vérifier que l'enseignant enseigne cette matière
    const enseignantMatiere = await prisma.enseignantMatiere.findFirst({
      where: {
        enseignantId: enseignant.id,
        matiereId: matiereId
      },
      include: {
        matiere: {
          select: {
            nom: true,
            classe: {
              select: {
                nom: true
              }
            }
          }
        }
      }
    });

    if (!enseignantMatiere) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à modifier les notes de cette matière'
      });
    }

    console.log(`✅ Enseignant autorisé pour la matière ${enseignantMatiere.matiere.nom} - Classe ${enseignantMatiere.matiere.classe.nom}`);
    
    // Ajouter les informations de l'enseignant à la requête pour les contrôleurs
    req.enseignant = enseignant;
    req.matiereAutorisee = enseignantMatiere;
    
    next();
  } catch (error) {
    console.error('❌ Erreur dans checkEnseignantMatiere:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions'
    });
  }
};

// Middleware pour vérifier qu'un enseignant peut accéder aux données d'une classe
export const checkEnseignantClasse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('👩‍🏫 Middleware checkEnseignantClasse - Vérification des permissions classe');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Si l'utilisateur est admin, autoriser l'accès
    if (req.user.role === 'admin') {
      console.log('✅ Utilisateur admin - accès autorisé');
      return next();
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId: req.user.id }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent accéder à cette ressource'
      });
    }

    const classeId = req.params.classeId;
    
    if (!classeId) {
      return res.status(400).json({
        success: false,
        message: 'Classe non spécifiée'
      });
    }

    // Vérifier que l'enseignant enseigne dans cette classe ou en est le titulaire
    const enseignantClasse = await prisma.enseignantClasse.findFirst({
      where: {
        enseignantId: enseignant.id,
        classeId: classeId
      },
      include: {
        classe: {
          select: {
            nom: true
          }
        }
      }
    });

    // Vérifier aussi si l'enseignant est titulaire de la classe
    const classeTitulaire = await prisma.classe.findFirst({
      where: {
        id: classeId,
        titulaireEnseignant: {
          id: enseignant.id
        }
      },
      select: {
        nom: true
      }
    });

    if (!enseignantClasse && !classeTitulaire) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accéder aux données de cette classe'
      });
    }

    const nomClasse = enseignantClasse?.classe.nom || classeTitulaire?.nom;
    console.log(`✅ Enseignant autorisé pour la classe ${nomClasse}`);
    
    // Ajouter les informations de l'enseignant à la requête
    req.enseignant = enseignant;
    req.classeAutorisee = enseignantClasse || { classe: classeTitulaire };
    
    next();
  } catch (error) {
    console.error('❌ Erreur dans checkEnseignantClasse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions'
    });
  }
};

// Middleware pour vérifier qu'un enseignant peut voir les notes d'un élève
export const checkEnseignantEleve = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('👩‍🏫 Middleware checkEnseignantEleve - Vérification des permissions élève');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    // Si l'utilisateur est admin, autoriser l'accès
    if (req.user.role === 'admin') {
      console.log('✅ Utilisateur admin - accès autorisé');
      return next();
    }

    // Récupérer l'enseignant à partir de l'utilisateur
    const enseignant = await prisma.enseignant.findFirst({
      where: { userId: req.user.id }
    });

    if (!enseignant) {
      return res.status(403).json({
        success: false,
        message: 'Seuls les enseignants peuvent accéder à cette ressource'
      });
    }

    const studentId = req.params.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Élève non spécifié'
      });
    }

    // Récupérer l'élève et sa classe
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        classe: {
          select: {
            id: true,
            nom: true
          }
        }
      }
    });

    if (!student || !student.classe) {
      return res.status(404).json({
        success: false,
        message: 'Élève non trouvé'
      });
    }

    // Vérifier que l'enseignant enseigne dans la classe de l'élève
    const enseignantClasse = await prisma.enseignantClasse.findFirst({
      where: {
        enseignantId: enseignant.id,
        classeId: student.classe.id
      }
    });

    // Vérifier aussi si l'enseignant est titulaire de la classe
    const classeTitulaire = await prisma.classe.findFirst({
      where: {
        id: student.classe.id,
        titulaireEnseignant: {
          id: enseignant.id
        }
      }
    });

    if (!enseignantClasse && !classeTitulaire) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à accéder aux données de cet élève'
      });
    }

    console.log(`✅ Enseignant autorisé pour l'élève ${student.firstName} ${student.lastName} - Classe ${student.classe.nom}`);
    
    // Ajouter les informations à la requête
    req.enseignant = enseignant;
    req.eleveAutorise = student;
    
    next();
  } catch (error) {
    console.error('❌ Erreur dans checkEnseignantEleve:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions'
    });
  }
};

// Étendre l'interface Request pour TypeScript
declare global {
  namespace Express {
    interface Request {
      enseignant?: any;
      matiereAutorisee?: any;
      classeAutorisee?: any;
      eleveAutorise?: any;
    }
  }
}