import type { Request, Response } from 'express';
import prisma from '../../prisma';

// Génère un matricule unique (ex: ISJ-2024-XXXX)
function generateMatricule() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ISJ-${year}-${random}`;
}

// Génère la promotion automatiquement (ex: 2024-2025)
function generatePromotion() {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${currentYear + 1}`;
}

// Génère un matricule structuré basé sur la section et option
async function generateStructuredMatricule(section: string, option: string) {
  const currentYear = new Date().getFullYear();
  
  // Mapping des abréviations section + option
  const sectionOptionMap: Record<string, string> = {
    'Commerciale-Gestion': 'CG',
    'Commerciale-Informatique': 'CI',
    'Littéraire-Math-Info': 'LM',
    'Littéraire-Sciences': 'LS',
    'Scientifique-Math': 'SM',
    'Scientifique-Biologie': 'SB',
    'Scientifique-Chimie': 'SC',
    'Scientifique-Physique': 'SP',
    'Technique-Electricité': 'TE',
    'Technique-Mécanique': 'TM',
    'Technique-Informatique': 'TI',
  };
  
  const key = `${section}-${option}`;
  const abbreviation = sectionOptionMap[key] || 'XX';
  
  // Compter les élèves existants pour cette combinaison année + section + option
  const existingStudents = await prisma.student.findMany({
    where: {
      AND: [
        { promotion: { contains: currentYear.toString() } },
        { section: section },
        { option: option }
      ]
    },
    orderBy: { matricule: 'desc' }
  });
  
  // Trouver le plus grand numéro séquentiel existant
  let maxSequence = 0;
  existingStudents.forEach(student => {
    const match = student.matricule.match(new RegExp(`ISJ-${currentYear}-${abbreviation}-(\\d{3})`));
    if (match) {
      const sequence = parseInt(match[1]);
      if (sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  });
  
  const sequenceNumber = (maxSequence + 1).toString().padStart(3, '0');
  const matricule = `ISJ-${currentYear}-${abbreviation}-${sequenceNumber}`;
  
  // Vérification supplémentaire pour s'assurer que le matricule n'existe pas déjà
  const existingMatricule = await prisma.student.findUnique({
    where: { matricule }
  });
  
  if (existingMatricule) {
    // Si le matricule existe déjà, incrémenter le numéro séquentiel
    const newSequenceNumber = (maxSequence + 2).toString().padStart(3, '0');
    return `ISJ-${currentYear}-${abbreviation}-${newSequenceNumber}`;
  }
  
  return matricule;
}

// Vérifie la capacité d'une classe avant d'ajouter un élève
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

// Vérifie les conflits d'affectation d'un élève
async function checkStudentConflicts(studentId: string, newClasseId: string): Promise<{
  hasConflict: boolean;
  conflicts: string[];
}> {
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

  if (!student) {
    return { hasConflict: false, conflicts: [] };
  }

  const newClasse = await prisma.classe.findUnique({
    where: { id: newClasseId },
    include: {
      section: true,
      option: true
    }
  });

  if (!newClasse) {
    return { hasConflict: true, conflicts: ['Nouvelle classe non trouvée'] };
  }

  const conflicts: string[] = [];

  // Si l'élève est déjà dans une classe active
  if (student.classeId && student.classeId !== newClasseId) {
    conflicts.push(`L'élève est déjà affecté à la classe: ${student.classe?.nom}`);
  }

  // Vérifier la compatibilité section/option si applicable
  if (student.classe && newClasse) {
    if (student.classe.sectionId !== newClasse.sectionId) {
      conflicts.push(`Changement de section: ${student.classe.section?.nom} vers ${newClasse.section?.nom}`);
    }
    if (student.classe.optionId !== newClasse.optionId) {
      conflicts.push(`Changement d'option: ${student.classe.option?.nom} vers ${newClasse.option?.nom}`);
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}

// Endpoint pour générer les informations automatiques
export const generateStudentInfo = async (req: Request, res: Response) => {
  try {
    const { section, option } = req.body;
    
    if (!section || !option) {
      return res.status(400).json({ 
        success: false, 
        message: 'Section et option sont requises' 
      });
    }
    
    const promotion = generatePromotion();
    const matricule = await generateStructuredMatricule(section, option);
    
    res.status(200).json({
      success: true,
      data: {
        promotion,
        matricule
      }
    });
  } catch (error) {
    console.error('[GET /eleves/generate-info] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération des informations' 
    });
  }
};

// Liste paginée des élèves
export const getAllEleves = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';
    const classeId = req.query.classeId as string;
    
    const where: any = { isActive: true };
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (classeId) {
      where.classeId = classeId;
    }
    
    const [eleves, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: { 
          classe: {
            include: {
              section: true,
              option: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);
    res.status(200).json({
      success: true,
      data: eleves,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /eleves] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des élèves', error });
  }
};

// Obtenir la liste des élèves par classe
export const getElevesByClasse = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;
    
    if (!classeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de classe requis'
      });
    }

    const classe = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        students: {
          where: { isActive: true },
          orderBy: [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ]
        },
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

    const capacityInfo = await checkClassCapacity(classeId);

    res.status(200).json({
      success: true,
      data: {
        classe: {
          id: classe.id,
          nom: classe.nom,
          salle: classe.salle,
          section: classe.section?.nom,
          option: classe.option?.nom,
          anneeScolaire: classe.anneeScolaire,
          description: classe.description
        },
        eleves: classe.students,
        capacityInfo
      }
    });
  } catch (error) {
    console.error('[GET /eleves/classe/:classeId] Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des élèves de la classe', 
      error 
    });
  }
};

// Ajouter un élève à une classe (avec validation de capacité et conflits)
export const addEleveToClasse = async (req: Request, res: Response) => {
  try {
    const { eleveId, classeId, forceAssignment = false } = req.body;
    
    if (!eleveId || !classeId) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'élève et ID de la classe sont requis'
      });
    }

    // Vérifier que l'élève existe
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

    // Vérifier la capacité de la classe
    const capacityCheck = await checkClassCapacity(classeId);
    if (!capacityCheck.canAdd) {
      return res.status(400).json({
        success: false,
        message: capacityCheck.message,
        capacityInfo: capacityCheck
      });
    }

    // Vérifier les conflits
    const conflictCheck = await checkStudentConflicts(eleveId, classeId);
    if (conflictCheck.hasConflict && !forceAssignment) {
      return res.status(409).json({
        success: false,
        message: 'Conflits détectés dans l\'affectation',
        conflicts: conflictCheck.conflicts,
        canForce: true
      });
    }

    // Obtenir les informations de la nouvelle classe
    const newClasse = await prisma.classe.findUnique({
      where: { id: classeId },
      include: {
        section: true,
        option: true
      }
    });

    if (!newClasse) {
      return res.status(404).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }

    // Effectuer l'affectation
    const updatedEleve = await prisma.student.update({
      where: { id: eleveId },
      data: {
        classeId: classeId,
        class: newClasse.nom,
        section: newClasse.section?.nom || eleve.section,
        option: newClasse.option?.nom || eleve.option
      },
      include: {
        classe: {
          include: {
            section: true,
            option: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedEleve,
      message: `Élève ${eleve.firstName} ${eleve.lastName} affecté à la classe ${newClasse.nom}`,
      warnings: conflictCheck.hasConflict ? conflictCheck.conflicts : undefined
    });

  } catch (error) {
    console.error('[POST /eleves/add-to-classe] Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'affectation de l\'élève à la classe',
      error
    });
  }
};

// Créer un élève
export const createEleve = async (req: Request, res: Response) => {
  try {
    console.log('[createEleve] Données reçues:', req.body);
    console.log('[createEleve] Headers:', req.headers);
    
    const { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, classeId, matricule, sectionId, optionId } = req.body;
    console.log('[createEleve] Données extraites:', { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, classeId, matricule, sectionId, optionId });
    
    if (!userId || !firstName || !lastName || !gender || !birthDate || !promotion || !parentPhone || !matricule) {
      console.log('[createEleve] Champs manquants:', { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, matricule });
      return res.status(400).json({ success: false, message: 'Champs requis manquants' });
    }
    
    // Vérifier que l'utilisateur existe et n'est pas déjà lié
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Utilisateur non trouvé ou non étudiant' });
    }
    
    const alreadyLinked = await prisma.student.findFirst({ where: { userId: { equals: userId } } });
    if (alreadyLinked) {
      return res.status(400).json({ success: false, message: 'Cet utilisateur est déjà lié à un élève' });
    }
    
    // Si une classe est spécifiée, vérifier sa capacité
    if (classeId) {
      const capacityCheck = await checkClassCapacity(classeId);
      if (!capacityCheck.canAdd) {
        return res.status(400).json({
          success: false,
          message: capacityCheck.message,
          capacityInfo: capacityCheck
        });
      }
    }
    
    // Vérifier que la classe existe (si spécifiée)
    let classe = null;
    if (classeId) {
      classe = await prisma.classe.findUnique({ 
        where: { id: classeId },
        include: { section: true, option: true }
      });
      if (!classe) {
        return res.status(400).json({ success: false, message: 'Classe non trouvée' });
      }
    }
    
    // Vérifier que la section et l'option existent (si spécifiées)
    let section = null;
    let option = null;
    
    if (sectionId) {
      section = await prisma.section.findUnique({ where: { id: sectionId } });
      if (!section) {
        return res.status(400).json({ success: false, message: 'Section non trouvée' });
      }
    }
    
    if (optionId) {
      option = await prisma.option.findUnique({ where: { id: optionId } });
      if (!option) {
        return res.status(400).json({ success: false, message: 'Option non trouvée' });
      }
    }
    
    // Vérifier que le matricule n'existe pas déjà
    const existingMatricule = await prisma.student.findUnique({ where: { matricule } });
    if (existingMatricule) {
      console.log('[createEleve] Matricule déjà existant:', matricule);
      return res.status(400).json({ 
        success: false, 
        message: `Le matricule ${matricule} existe déjà. Veuillez réessayer.` 
      });
    }
    
    // Vérification supplémentaire : s'assurer que le matricule suit le bon format
    const matriculePattern = /^ISJ-\d{4}-[A-Z]{2}-\d{3}$/;
    if (!matriculePattern.test(matricule)) {
      console.log('[createEleve] Format de matricule invalide:', matricule);
      return res.status(400).json({ 
        success: false, 
        message: 'Format de matricule invalide. Le matricule doit suivre le format ISJ-AAAA-XX-000' 
      });
    }
    
    const eleve = await prisma.student.create({
      data: {
        userId,
        firstName,
        lastName,
        gender,
        birthDate: new Date(birthDate),
        class: classe?.nom || '', // Utiliser le nom de la classe ou vide si pas de classe
        section: section?.nom || classe?.section?.nom || '', // Utiliser la section spécifiée ou celle de la classe
        option: option?.nom || classe?.option?.nom || '', // Utiliser l'option spécifiée ou celle de la classe
        promotion,
        parentPhone,
        classeId,
        matricule,
        isActive: true,
      },
      include: { 
        classe: {
          include: {
            section: true,
            option: true
          }
        }
      },
    });
    
    res.status(201).json({ 
      success: true, 
      data: eleve,
      message: `Élève ${firstName} ${lastName} créé avec succès${classe ? ` et affecté à la classe ${classe.nom}` : ''}`
    });
  } catch (error) {
    console.error('[POST /eleves] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la création de l\'élève', error });
  }
};

// Détail d'un élève
export const getEleveById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eleve = await prisma.student.findUnique({
      where: { id },
      include: { classe: true },
    });
    if (!eleve) {
      return res.status(404).json({ success: false, message: 'Élève non trouvé' });
    }
    res.status(200).json({ success: true, data: eleve });
  } catch (error) {
    console.error('[GET /eleves/:id] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération de l\'élève', error });
  }
};

// Modifier un élève
export const updateEleve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, gender, birthDate, class: className, promotion, parentPhone, classeId } = req.body;
    const eleve = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        gender,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        class: className,
        promotion,
        parentPhone,
        classeId,
      },
      include: { classe: true },
    });
    res.status(200).json({ success: true, data: eleve });
  } catch (error) {
    console.error('[PUT /eleves/:id] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la modification de l\'élève', error });
  }
};

// Archiver (désactiver) un élève
export const archiveEleve = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eleve = await prisma.student.update({
      where: { id },
      data: { isActive: false },
    });
    res.status(200).json({ success: true, data: eleve });
  } catch (error) {
    console.error('[DELETE /eleves/:id] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'archivage de l\'élève', error });
  }
}; 