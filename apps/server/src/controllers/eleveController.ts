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
    const where: any = { isActive: true };
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [eleves, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: { classe: true },
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

// Créer un élève
export const createEleve = async (req: Request, res: Response) => {
  try {
    console.log('[createEleve] Données reçues:', req.body);
    console.log('[createEleve] Headers:', req.headers);
    
    const { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, classeId, matricule, sectionId, optionId } = req.body;
    console.log('[createEleve] Données extraites:', { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, classeId, matricule, sectionId, optionId });
    
    if (!userId || !firstName || !lastName || !gender || !birthDate || !promotion || !parentPhone || !classeId || !matricule || !sectionId || !optionId) {
      console.log('[createEleve] Champs manquants:', { userId, firstName, lastName, gender, birthDate, promotion, parentPhone, classeId, matricule, sectionId, optionId });
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
    
    // Vérifier que la classe existe
    const classe = await prisma.classe.findUnique({ 
      where: { id: classeId },
      include: { section: true, option: true }
    });
    if (!classe) {
      return res.status(400).json({ success: false, message: 'Classe non trouvée' });
    }
    
    // Vérifier que la section et l'option existent
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      return res.status(400).json({ success: false, message: 'Section non trouvée' });
    }
    
    const option = await prisma.option.findUnique({ where: { id: optionId } });
    if (!option) {
      return res.status(400).json({ success: false, message: 'Option non trouvée' });
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
        class: classe.nom, // Utiliser le nom de la classe
        section: section.nom, // Utiliser le nom de la section
        option: option.nom, // Utiliser le nom de l'option
        promotion,
        parentPhone,
        classeId,
        matricule, // Use the provided matricule
        isActive: true,
      },
      include: { classe: true },
    });
    res.status(201).json({ success: true, data: eleve });
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