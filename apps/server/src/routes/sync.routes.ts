import { Router, Request, Response } from 'express';
import prisma from '../../prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

interface SyncOperation {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

interface SyncResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Endpoint pour traiter un lot d'opérations de synchronisation
router.post('/batch', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { operations }: { operations: SyncOperation[] } = req.body;

    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({
        success: false,
        error: 'Format invalide: operations doit être un tableau'
      });
    }

    const results: SyncResult[] = [];

    // Traiter chaque opération dans l'ordre chronologique
    for (const operation of operations) {
      try {
        const result = await processOperation(operation, req);
        results.push(result);
      } catch (error) {
        console.error('Erreur lors du traitement de l\'opération:', error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    res.status(200).json({
      success: failureCount === 0,
      processed: successCount,
      failed: failureCount,
      results
    });

  } catch (error) {
    console.error('Erreur lors de la synchronisation en lot:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la synchronisation'
    });
  }
});

// Endpoint pour traiter une opération individuelle
router.post('/operation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const operation: SyncOperation = req.body;

    if (!operation.endpoint || !operation.method || !operation.type) {
      return res.status(400).json({
        success: false,
        error: 'Paramètres manquants: endpoint, method et type sont requis'
      });
    }

    const result = await processOperation(operation, req);
    res.status(result.success ? 200 : 400).json(result);

  } catch (error) {
    console.error('Erreur lors du traitement de l\'opération:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur'
    });
  }
});

// Route de health check pour tester la connectivité
router.head('/health', (_req: Request, res: Response) => {
  res.status(200).end();
});

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Fonction pour traiter une opération de synchronisation
async function processOperation(operation: SyncOperation, req: Request): Promise<SyncResult> {
  const { endpoint, method, type, data } = operation;

  try {
    // Parser l'endpoint pour extraire l'entité et l'ID
    const endpointParts = endpoint.split('/').filter(part => part !== '');
    const entity = endpointParts[1]; // ex: 'academics'
    const subEntity = endpointParts[2]; // ex: 'eleves'
    const id = endpointParts[3]; // ID pour les opérations UPDATE/DELETE

    // Mapper les endpoints vers les opérations Prisma
    switch (`${entity}/${subEntity}`) {
      case 'academics/eleves':
        return await handleStudentOperation(type, method, data, id);
      
      case 'academics/classes':
        return await handleClassOperation(type, method, data, id);
      
      case 'academics/enseignants':
        return await handleTeacherOperation(type, method, data, id);
      
      case 'academics/notes':
        return await handleGradeOperation(type, method, data, id);
      
      case 'academics/bulletins':
        return await handleBulletinOperation(type, method, data, id);
      
      default:
        throw new Error(`Endpoint non supporté: ${endpoint}`);
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

// Gestion des opérations sur les étudiants
async function handleStudentOperation(
  type: string,
  method: string,
  data: any,
  id?: string
): Promise<SyncResult> {
  try {
    switch (type) {
      case 'CREATE':
        const newStudent = await prisma.student.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return { success: true, data: newStudent };

      case 'UPDATE':
        if (!id) throw new Error('ID requis pour la mise à jour');
        const updatedStudent = await prisma.student.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
        return { success: true, data: updatedStudent };

      case 'DELETE':
        if (!id) throw new Error('ID requis pour la suppression');
        await prisma.student.delete({
          where: { id }
        });
        return { success: true };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  } catch (error) {
    throw new Error(`Erreur étudiant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Gestion des opérations sur les classes
async function handleClassOperation(
  type: string,
  method: string,
  data: any,
  id?: string
): Promise<SyncResult> {
  try {
    switch (type) {
      case 'CREATE':
        const newClass = await prisma.classe.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return { success: true, data: newClass };

      case 'UPDATE':
        if (!id) throw new Error('ID requis pour la mise à jour');
        const updatedClass = await prisma.classe.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
        return { success: true, data: updatedClass };

      case 'DELETE':
        if (!id) throw new Error('ID requis pour la suppression');
        await prisma.classe.delete({
          where: { id }
        });
        return { success: true };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  } catch (error) {
    throw new Error(`Erreur classe: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Gestion des opérations sur les enseignants
async function handleTeacherOperation(
  type: string,
  method: string,
  data: any,
  id?: string
): Promise<SyncResult> {
  try {
    switch (type) {
      case 'CREATE':
        const newTeacher = await prisma.enseignant.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return { success: true, data: newTeacher };

      case 'UPDATE':
        if (!id) throw new Error('ID requis pour la mise à jour');
        const updatedTeacher = await prisma.enseignant.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
        return { success: true, data: updatedTeacher };

      case 'DELETE':
        if (!id) throw new Error('ID requis pour la suppression');
        await prisma.enseignant.delete({
          where: { id }
        });
        return { success: true };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  } catch (error) {
    throw new Error(`Erreur enseignant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Gestion des opérations sur les notes
async function handleGradeOperation(
  type: string,
  method: string,
  data: any,
  id?: string
): Promise<SyncResult> {
  try {
    switch (type) {
      case 'CREATE':
        const newGrade = await prisma.note.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return { success: true, data: newGrade };

      case 'UPDATE':
        if (!id) throw new Error('ID requis pour la mise à jour');
        const updatedGrade = await prisma.note.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
        return { success: true, data: updatedGrade };

      case 'DELETE':
        if (!id) throw new Error('ID requis pour la suppression');
        await prisma.note.delete({
          where: { id }
        });
        return { success: true };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  } catch (error) {
    throw new Error(`Erreur note: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

// Gestion des opérations sur les bulletins
async function handleBulletinOperation(
  type: string,
  method: string,
  data: any,
  id?: string
): Promise<SyncResult> {
  try {
    switch (type) {
      case 'CREATE':
        const newBulletin = await prisma.bulletin.create({
          data: {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        return { success: true, data: newBulletin };

      case 'UPDATE':
        if (!id) throw new Error('ID requis pour la mise à jour');
        const updatedBulletin = await prisma.bulletin.update({
          where: { id },
          data: {
            ...data,
            updatedAt: new Date()
          }
        });
        return { success: true, data: updatedBulletin };

      case 'DELETE':
        if (!id) throw new Error('ID requis pour la suppression');
        await prisma.bulletin.delete({
          where: { id }
        });
        return { success: true };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  } catch (error) {
    throw new Error(`Erreur bulletin: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

export default router;