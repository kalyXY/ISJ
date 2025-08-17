import type { Request, Response } from 'express';
import prisma from '../../../prisma';

// NOTE: This controller is written with the assumption that `npx prisma generate`
// has been run successfully after adding `salleCode: String?` to the Student model.
// The code may show type errors in an environment where the Prisma client is not updated.

/**
 * Récupère les salles disponibles pour une classe logique.
 * Une "classe logique" (ex: "1ère CG") est identifiée par son nom.
 * Les "salles" sont des enregistrements `Classe` qui partagent ce nom mais ont un champ `salle` défini.
 */
export const getSallesForClasse = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;

    // 1. Trouver la classe logique pour obtenir son nom.
    const logicalClasse = await prisma.classe.findUnique({
      where: { id: classeId },
    });

    if (!logicalClasse) {
      return res.status(404).json({ success: false, message: 'Classe logique non trouvée.' });
    }

    // 2. Trouver toutes les classes (salles) qui partagent le même nom et année scolaire,
    //    mais qui ont une salle définie.
    const salles = await prisma.classe.findMany({
      where: {
        nom: logicalClasse.nom,
        anneeScolaire: logicalClasse.anneeScolaire,
        salle: {
          not: null,
        },
      },
      select: {
        id: true,
        salle: true,
        description: true,
      },
      orderBy: {
        salle: 'asc',
      },
    });

    res.status(200).json({ success: true, data: salles });
  } catch (error) {
    console.error('[GET /classes/:classeId/salles] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * Récupère les élèves d'une classe logique, avec une option pour filtrer
 * ceux qui n'ont pas encore de salle assignée.
 */
export const getStudentsForClasse = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;
    const { unassigned } = req.query; // 'true' or 'false'

    const whereClause: any = {
      classeId: classeId,
      isActive: true,
    };

    // Le champ `salleCode` est la nouvelle propriété du modèle Student.
    if (unassigned === 'true') {
      whereClause.salleCode = null;
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricule: true,
        salleCode: true, // On inclut le nouveau champ
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('[GET /classes/:classeId/students] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * Affecte une liste d'élèves à une salle spécifique.
 */
export const assignStudentsToSalle = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;
    const { studentIds, salleCode } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !salleCode) {
      return res.status(400).json({ success: false, message: 'Les champs `studentIds` (tableau) et `salleCode` sont requis.' });
    }

    // --- Validation ---
    // 1. Valider que la salle de destination existe et appartient à la classe logique.
    const logicalClasse = await prisma.classe.findUnique({ where: { id: classeId } });
    if (!logicalClasse) {
      return res.status(404).json({ success: false, message: 'Classe logique non trouvée.' });
    }

    const targetSalle = await prisma.classe.findFirst({
      where: {
        nom: logicalClasse.nom,
        anneeScolaire: logicalClasse.anneeScolaire,
        salle: salleCode,
      },
    });

    if (!targetSalle) {
      return res.status(400).json({ success: false, message: `La salle '${salleCode}' n'appartient pas à cette classe.` });
    }

    // 2. Valider que tous les élèves appartiennent bien à la classe logique.
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, classeId: true },
    });

    const invalidStudents = students.filter(s => s.classeId !== classeId);
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Certains élèves n\'appartiennent pas à la classe spécifiée.',
        invalidStudentIds: invalidStudents.map(s => s.id),
      });
    }

    if(students.length !== studentIds.length){
       return res.status(404).json({ success: false, message: 'Certains élèves n\'ont pas été trouvés.' });
    }

    // --- Mise à jour ---
    const updateResult = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        classeId: classeId, // Double sécurité
      },
      data: {
        salleCode: salleCode,
      },
    });

    res.status(200).json({ success: true, message: `${updateResult.count} élève(s) affecté(s) à la salle ${salleCode}.` });
  } catch (error) {
    console.error('[POST /classes/:classeId/assign-students] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

/**
 * Désaffecte une liste d'élèves de leur salle.
 */
export const unassignStudentsFromSalle = async (req: Request, res: Response) => {
  try {
    const { classeId } = req.params;
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Le champ `studentIds` (tableau) est requis.' });
    }

    // Optionnel : Valider que les élèves appartiennent bien à la classe.
    const students = await prisma.student.findMany({
        where: { id: { in: studentIds }, classeId: classeId },
        select: { id: true },
    });

    if (students.length !== studentIds.length) {
        return res.status(400).json({
            success: false,
            message: 'Certains élèves n\'appartiennent pas à cette classe ou n\'ont pas été trouvés.',
        });
    }

    // --- Mise à jour ---
    const updateResult = await prisma.student.updateMany({
      where: {
        id: { in: studentIds },
        classeId: classeId,
      },
      data: {
        salleCode: null,
      },
    });

    res.status(200).json({ success: true, message: `${updateResult.count} élève(s) désaffecté(s).` });
  } catch (error) {
    console.error('[POST /classes/:classeId/unassign-students] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
