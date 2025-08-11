import express from 'express';
import { z } from 'zod';
import prisma from '../../prisma';
import { authenticateToken, checkRole } from '../middleware/authMiddleware';
import { checkClassCapacity } from '../controllers/academics/classeController';

const router = express.Router();

// Protect all classrooms routes (admin only)
router.use(authenticateToken, checkRole(['admin']));

// Helper: map Classe -> Classroom response shape
function mapClasseToClassroom(classe: any) {
  const studentsCount = classe.students?.length ?? classe._count?.students ?? 0;
  const capaciteMax = classe.capaciteMaximale ?? 30;
  return {
    id: classe.id,
    nom: classe.nom,
    numero: undefined,
    capaciteMax: capaciteMax,
    description: classe.description ?? null,
    batiment: null,
    etage: null,
    classeId: classe.id,
    classe: {
      id: classe.id,
      nom: classe.nom,
      anneeScolaire: classe.anneeScolaire,
      section: classe.section ? { nom: classe.section.nom } : null,
      option: classe.option ? { nom: classe.option.nom } : null,
    },
    _count: { students: studentsCount },
    students: undefined,
    createdAt: classe.createdAt,
    updatedAt: classe.updatedAt,
  };
}

// GET /api/classrooms - list classrooms from academic classes with optional filters
router.get('/', async (req, res) => {
  try {
    const search = (req.query.search as string) || '';
    const classeId = req.query.classeId as string | undefined;
    const hasAvailableSpace = req.query.hasAvailableSpace as string | undefined; // 'true' | 'false'

    const where: any = {};
    if (classeId) where.id = classeId;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const classes = await prisma.classe.findMany({
      where,
      include: {
        section: true,
        option: true,
        students: { where: { isActive: true } },
      },
      orderBy: { nom: 'asc' },
    });

    let mapped = classes.map(mapClasseToClassroom);
    if (hasAvailableSpace !== undefined) {
      const flag = hasAvailableSpace === 'true';
      mapped = mapped.filter(c => (c._count?.students ?? 0) < (c.capaciteMax ?? 30) === flag);
    }

    return res.status(200).json({ success: true, data: mapped });
  } catch (error: any) {
    console.error('[GET /api/classrooms] Error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du chargement des salles' });
  }
});

// GET /api/classrooms/:id - one classroom
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const classe = await prisma.classe.findUnique({
      where: { id },
      include: { section: true, option: true, students: { where: { isActive: true } } },
    });
    if (!classe) return res.status(404).json({ success: false, message: 'Salle (classe) non trouvée' });
    return res.status(200).json({ success: true, data: mapClasseToClassroom(classe) });
  } catch (error: any) {
    console.error('[GET /api/classrooms/:id] Error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du chargement de la salle' });
  }
});

// GET /api/classrooms/:id/students - active students in class
router.get('/:id/students', async (req, res) => {
  try {
    const { id } = req.params;
    const classe = await prisma.classe.findUnique({
      where: { id },
      include: { students: { where: { isActive: true }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }] } },
    });
    if (!classe) return res.status(404).json({ success: false, message: 'Salle (classe) non trouvée' });
    return res.status(200).json({ success: true, data: classe.students });
  } catch (error: any) {
    console.error('[GET /api/classrooms/:id/students] Error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors du chargement des élèves' });
  }
});

const assignSchema = z.object({
  studentId: z.string().min(1),
  classroomId: z.string().min(1),
  forceAssignment: z.boolean().optional().default(false),
});

// POST /api/classrooms/assign-student - assign student to classroom (classe)
router.post('/assign-student', async (req, res) => {
  try {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }
    const { studentId, classroomId, forceAssignment } = parsed.data;

    // capacity
    const capacity = await checkClassCapacity(classroomId);
    if (!capacity.canAdd) {
      return res.status(400).json({ success: false, message: capacity.message, capacityInfo: capacity });
    }

    // student exists
    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { classe: true } });
    if (!student) {
      return res.status(404).json({ success: false, message: "Élève non trouvé" });
    }

    // class exists
    const classe = await prisma.classe.findUnique({ where: { id: classroomId }, include: { section: true, option: true } });
    if (!classe) {
      return res.status(404).json({ success: false, message: 'Salle (classe) non trouvée' });
    }

    // simple conflict check
    if (student.classeId && student.classeId !== classroomId && !forceAssignment) {
      return res.status(409).json({
        success: false,
        message: "Conflits détectés dans l'affectation",
        conflicts: [
          `L'élève est déjà affecté à la classe: ${student.classe?.nom}`,
        ],
        canForce: true,
      });
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        classeId: classroomId,
        class: classe.nom,
        section: classe.section?.nom || student.section,
        option: classe.option?.nom || student.option,
      },
    });

    return res.status(200).json({ success: true, data: updated, message: `Élève ${student.firstName} ${student.lastName} affecté à la classe ${classe.nom}` });
  } catch (error: any) {
    console.error('[POST /api/classrooms/assign-student] Error:', error);
    return res.status(500).json({ success: false, message: "Erreur lors de l'affectation" });
  }
});

// POST /api/classrooms/bulk-assign - assign many
router.post('/bulk-assign', async (req, res) => {
  try {
    const body = z.object({ classroomId: z.string().min(1), studentIds: z.array(z.string().min(1)).min(1) }).parse(req.body);
    const { classroomId, studentIds } = body;

    const results: any[] = [];
    for (const studentId of studentIds) {
      const capacity = await checkClassCapacity(classroomId);
      if (!capacity.canAdd) {
        results.push({ studentId, status: 'failed', reason: capacity.message });
        continue;
      }
      try {
        await prisma.student.update({ where: { id: studentId }, data: { classeId: classroomId } });
        results.push({ studentId, status: 'ok' });
      } catch (e: any) {
        results.push({ studentId, status: 'failed', reason: e?.message || 'Erreur inconnue' });
      }
    }

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error('[POST /api/classrooms/bulk-assign] Error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de l\'assignation en masse' });
  }
});

// DELETE /api/classrooms/:classroomId/students/:studentId - remove student from class
router.delete('/:classroomId/students/:studentId', async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;

    const student = await prisma.student.findUnique({ where: { id: studentId }, include: { classe: true } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Élève non trouvé' });
    }
    if (student.classeId !== classroomId) {
      return res.status(400).json({ success: false, message: "L'élève n'est pas dans cette salle (classe)" });
    }

    const updated = await prisma.student.update({ where: { id: studentId }, data: { classeId: null, class: '' } });
    return res.status(200).json({ success: true, data: updated, message: `Élève ${student.firstName} ${student.lastName} retiré de la classe ${student.classe?.nom}` });
  } catch (error: any) {
    console.error('[DELETE /api/classrooms/:classroomId/students/:studentId] Error:', error);
    return res.status(500).json({ success: false, message: "Erreur lors du retrait de l'élève" });
  }
});

// GET /api/classrooms/:id/capacity - capacity info
router.get('/:id/capacity', async (req, res) => {
  try {
    const { id } = req.params;
    const classe = await prisma.classe.findUnique({ where: { id }, include: { students: { where: { isActive: true } } } });
    if (!classe) return res.status(404).json({ success: false, message: 'Salle (classe) non trouvée' });

    const capacity = classe.capaciteMaximale ?? 30;
    const currentCount = classe.students.length;
    const available = Math.max(0, capacity - currentCount);
    const percentage = capacity > 0 ? Math.round((currentCount / capacity) * 100) : 0;

    return res.status(200).json({ success: true, data: { capacity, currentCount, available, percentage } });
  } catch (error: any) {
    console.error('[GET /api/classrooms/:id/capacity] Error:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la capacité' });
  }
});

export default router; 