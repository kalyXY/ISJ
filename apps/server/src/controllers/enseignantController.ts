import type { Request, Response } from 'express';
import prisma from '../../prisma';

// Liste des enseignants
export const getAllEnseignants = async (req: Request, res: Response) => {
  try {
    console.log('[GET /enseignants] Début récupération enseignants');
    const enseignants = await prisma.enseignant.findMany({
      orderBy: { nom: 'asc' },
    });
    const enseignantsWithRelations = await Promise.all(
      enseignants.map(async (ens) => {
        const classes = await prisma.enseignantClasse.findMany({
          where: { enseignantId: ens.id },
          include: { classe: true },
        });
        const matieres = await prisma.enseignantMatiere.findMany({
          where: { enseignantId: ens.id },
          include: { matiere: true },
        });
        // Récupérer l'utilisateur lié si userId présent
        let user = null;
        if (ens.userId) {
          const u = await prisma.user.findUnique({ where: { id: ens.userId } });
          if (u) {
            user = {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
            };
          }
        }
        return {
          ...ens,
          classes: classes.map((c) => ({ id: c.classe.id, nom: c.classe.nom })),
          matieres: matieres.map((m) => ({ id: m.matiere.id, nom: m.matiere.nom })),
          user,
        };
      })
    );
    console.log('[GET /enseignants] Succès, nombre:', enseignantsWithRelations.length);
    res.status(200).json({ success: true, data: enseignantsWithRelations });
  } catch (error) {
    console.error('[GET /enseignants] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des enseignants', error });
  }
};

// Créer un enseignant
export const createEnseignant = async (req: Request, res: Response) => {
  try {
    console.log('[POST /enseignants] Payload reçu:', req.body);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId requis' });
    }
    // Vérifier que l'utilisateur existe et a le rôle enseignant
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Utilisateur non trouvé ou non enseignant' });
    }
    // Créer l'enseignant lié à ce user
    const enseignant = await prisma.enseignant.create({
      data: {
        userId,
        nom: user.firstName ? user.firstName + (user.lastName ? ' ' + user.lastName : '') : user.email,
        email: user.email,
      },
    });
    console.log('[POST /enseignants] Enseignant créé:', enseignant.id);
    res.status(201).json({ success: true, data: enseignant });
  } catch (error) {
    console.error('[POST /enseignants] Erreur complète:', error);
    res.status(500).json({ success: false, message: "Erreur lors de la création de l'enseignant", error: error?.message, stack: error?.stack });
  }
};

// Mettre à jour un enseignant
export const updateEnseignant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nom, email } = req.body;
    const enseignant = await prisma.enseignant.update({
      where: { id },
      data: { nom, email },
    });
    res.status(200).json({ success: true, data: enseignant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de l\'enseignant', error });
  }
};

// Supprimer un enseignant
export const deleteEnseignant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.enseignant.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Enseignant supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression de l\'enseignant', error });
  }
};

// Affecter des classes et matières à un enseignant
export const assignClasseMatiere = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { classeIds, matiereIds } = req.body;
    console.log('[PATCH /enseignants/:id/assign] id:', id, 'classeIds:', classeIds, 'matiereIds:', matiereIds);
    // Vérifier que l'enseignant existe
    const enseignant = await prisma.enseignant.findUnique({ where: { id } });
    if (!enseignant) {
      return res.status(404).json({ success: false, message: "Enseignant non trouvé" });
    }
    // Supprimer les anciennes liaisons classes/matières
    await prisma.enseignantClasse.deleteMany({ where: { enseignantId: id } });
    await prisma.enseignantMatiere.deleteMany({ where: { enseignantId: id } });
    // Créer les nouvelles liaisons classes
    if (Array.isArray(classeIds) && classeIds.length > 0) {
      await Promise.all(classeIds.map((classeId: string) =>
        prisma.enseignantClasse.create({ data: { enseignantId: id, classeId } })
      ));
    }
    // Créer les nouvelles liaisons matières
    if (Array.isArray(matiereIds) && matiereIds.length > 0) {
      await Promise.all(matiereIds.map((matiereId: string) =>
        prisma.enseignantMatiere.create({ data: { enseignantId: id, matiereId } })
      ));
    }
    // Retourner l'enseignant avec ses classes et matières liées
    const enseignantMaj = await prisma.enseignant.findUnique({
      where: { id },
      include: {
        enseignantClasses: { include: { classe: true } },
        enseignantMatieres: { include: { matiere: true } },
      },
    });
    res.status(200).json({ success: true, data: enseignantMaj });
  } catch (error) {
    console.error('[PATCH /enseignants/:id/assign] Erreur complète:', error);
    res.status(500).json({ success: false, message: "Erreur lors de l'affectation", error: error?.message, stack: error?.stack });
  }
};

// Liste des présences d'un enseignant
export const getEnseignantPresences = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const presences = await prisma.presence.findMany({
      where: { enseignantId: id },
      orderBy: { date: 'desc' },
    });
    res.status(200).json({ success: true, data: presences });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des présences', error });
  }
};

// Rapport de performance d'un enseignant (exemple simple)
export const getEnseignantPerformance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Exemple : taux de présence
    const total = await prisma.presence.count({ where: { enseignantId: id } });
    const presents = await prisma.presence.count({ where: { enseignantId: id, status: 'Présent' } });
    const absents = await prisma.presence.count({ where: { enseignantId: id, status: 'Absent' } });
    const enRetard = await prisma.presence.count({ where: { enseignantId: id, status: 'En retard' } });
    res.status(200).json({
      success: true,
      data: {
        total,
        presents,
        absents,
        enRetard,
        tauxPresence: total > 0 ? (presents / total) * 100 : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors du rapport de performance', error });
  }
}; 