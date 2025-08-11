import axiosInstance from '@/lib/axiosInstance';
import { Student } from '@/types/student';
import type { VariantProps } from 'class-variance-authority';
import { badgeVariants } from '@/components/ui/badge';

// Types pour les salles de classe
export interface Classroom {
  id: string;
  nom: string;
  numero?: string;
  capaciteMax: number;
  description?: string;
  batiment?: string;
  etage?: number;
  classeId?: string;
  classe?: {
    id: string;
    nom: string;
    anneeScolaire: string;
    section?: {
      nom: string;
    };
    option?: {
      nom: string;
    };
  };
  _count?: {
    students: number;
  };
  students?: Student[];
  createdAt: string;
  updatedAt: string;
}

// Helper: transformer une "classe" académique en "classroom" pour le module Salles
function mapClasseToClassroom(classe: any): Classroom {
  return {
    id: classe.id,
    // Nom affiché: salle si présente sinon nom de la classe
    nom: classe.salle ? `${classe.nom} - Salle ${classe.salle}` : classe.nom,
    // Le module Salles attend "capaciteMax"
    capaciteMax: classe.capaciteMaximale ?? 30,
    description: classe.description ?? undefined,
    // Pas de bâtiment/étage dans le modèle actuel
    batiment: undefined,
    etage: undefined,
    // Lier la classe source
    classeId: classe.id,
    classe: {
      id: classe.id,
      nom: classe.nom,
      anneeScolaire: classe.anneeScolaire,
      section: classe.section ? { nom: classe.section.nom } : undefined,
      option: classe.option ? { nom: classe.option.nom } : undefined,
    },
    _count: { students: classe.studentsCount ?? (classe.students?.length ?? 0) },
    students: classe.students ?? undefined,
    createdAt: classe.createdAt ?? new Date().toISOString(),
    updatedAt: classe.updatedAt ?? new Date().toISOString(),
  };
}

export interface ClassroomCreateData {
  nom: string;
  numero?: string;
  capaciteMax: number;
  description?: string;
  batiment?: string;
  etage?: number;
  classeId?: string;
}

export interface ClassroomUpdateData {
  nom?: string;
  numero?: string;
  capaciteMax?: number;
  description?: string;
  batiment?: string;
  etage?: number;
  classeId?: string;
}

export interface StudentAssignment {
  studentId: string;
  classroomId: string;
}

export interface BulkAssignmentData {
  classroomId: string;
  studentIds: string[];
}

export interface ClassroomFilters {
  search?: string;
  classeId?: string;
  batiment?: string;
  hasAvailableSpace?: boolean;
}

// API calls pour les salles de classe
export const getClassrooms = async (filters?: ClassroomFilters): Promise<Classroom[]> => {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.classeId) params.append('classeId', filters.classeId);
  if (filters?.batiment) params.append('batiment', filters.batiment);
  if (filters?.hasAvailableSpace !== undefined) {
    params.append('hasAvailableSpace', filters.hasAvailableSpace.toString());
  }

  try {
    const response = await axiosInstance.get(`/classrooms?${params.toString()}`);
    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Fallback: charger les classes académiques et les transformer en "salles"
      const classesRes = await axiosInstance.get('/academics/classes');
      const classes = classesRes.data.data as any[];
      const mapped = classes.map(mapClasseToClassroom);
      // Filtrages côté client si besoin
      const filtered = mapped.filter((c) => {
        const bySearch = !filters?.search || c.nom.toLowerCase().includes(filters.search.toLowerCase());
        const byClasse = !filters?.classeId || c.classeId === filters.classeId;
        const byAvailable =
          filters?.hasAvailableSpace === undefined ? true : (c._count?.students ?? 0) < c.capaciteMax;
        const byBatiment = !filters?.batiment || filters.batiment === 'all' || c.batiment === filters.batiment;
        return bySearch && byClasse && byAvailable && byBatiment;
      });
      return filtered;
    }
    throw error;
  }
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
  try {
    const response = await axiosInstance.get(`/classrooms/${id}`);
    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Fallback: récupérer la classe et la transformer
      const res = await axiosInstance.get(`/academics/classes/${id}`);
      return mapClasseToClassroom(res.data.data);
    }
    throw error;
  }
};

export const createClassroom = async (data: ClassroomCreateData): Promise<Classroom> => {
  try {
    const response = await axiosInstance.post('/classrooms', data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateClassroom = async (id: string, data: ClassroomUpdateData): Promise<Classroom> => {
  try {
    const response = await axiosInstance.put(`/classrooms/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const deleteClassroom = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/classrooms/${id}`);
  } catch (error) {
    throw error;
  }
};

// API calls pour l'assignation d'élèves
export const assignStudentToClassroom = async (data: StudentAssignment): Promise<void> => {
  try {
    // Fallback direct vers l'API académique (ajout élève à classe)
    await axiosInstance.post('/academics/eleves/add-to-classe', {
      eleveId: data.studentId,
      classeId: data.classroomId,
    });
  } catch (error) {
    throw error;
  }
};

export const removeStudentFromClassroom = async (studentId: string, classroomId: string): Promise<void> => {
  try {
    // Utiliser l'endpoint académique existant
    await axiosInstance.delete(`/academics/classes/${classroomId}/students/${studentId}`);
  } catch (error) {
    throw error;
  }
};

export const bulkAssignStudents = async (data: BulkAssignmentData): Promise<void> => {
  try {
    // Fallback: assigner un par un via l'API académique
    for (const sid of data.studentIds) {
      await assignStudentToClassroom({ studentId: sid, classroomId: data.classroomId });
    }
  } catch (error) {
    throw error;
  }
};

export const getStudentsInClassroom = async (classroomId: string): Promise<Student[]> => {
  try {
    const response = await axiosInstance.get(`/classrooms/${classroomId}/students`);
    return response.data.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Fallback: récupérer la classe et renvoyer ses élèves
      const res = await axiosInstance.get(`/academics/classes/${classroomId}`);
      return res.data.data?.students ?? [];
    }
    throw error;
  }
};

export const getAvailableStudents = async (classroomId?: string): Promise<Student[]> => {
  const params = new URLSearchParams();
  if (classroomId) params.append('excludeClassroom', classroomId);
  
  try {
    const response = await axiosInstance.get(`/students/available?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

// API calls pour la vérification des conflits
export const checkAssignmentConflicts = async (studentId: string, classroomId: string): Promise<{
  hasConflict: boolean;
  conflicts: Array<{
    type: 'schedule' | 'capacity' | 'duplicate';
    message: string;
    classroomId?: string;
    classroomName?: string;
  }>;
}> => {
  // Fallback minimal: vérifier la capacité de la classe
  const classe = await getClassroomById(classroomId);
  const current = classe._count?.students ?? 0;
  const max = classe.capaciteMax ?? 30;
  if (current >= max) {
    return {
      hasConflict: true,
      conflicts: [{ type: 'capacity', message: `Capacité atteinte (${max})`, classroomId, classroomName: classe.nom }],
    };
  }
  return { hasConflict: false, conflicts: [] };
};

export const getClassroomCapacityInfo = async (classroomId: string): Promise<{
  capacity: number;
  currentCount: number;
  available: number;
  percentage: number;
}> => {
  // Fallback: calculer depuis la classe
  const classe = await getClassroomById(classroomId);
  const capacity = classe.capaciteMax ?? 30;
  const currentCount = classe._count?.students ?? 0;
  const available = Math.max(0, capacity - currentCount);
  const percentage = capacity > 0 ? Math.round((currentCount / capacity) * 100) : 0;
  return { capacity, currentCount, available, percentage };
};

// Fonctions utilitaires
export const calculateOccupancyRate = (classroom: Classroom): number => {
  const currentCount = classroom._count?.students || 0;
  return classroom.capaciteMax > 0 ? Math.round((currentCount / classroom.capaciteMax) * 100) : 0;
};

export const isClassroomFull = (classroom: Classroom): boolean => {
  const currentCount = classroom._count?.students || 0;
  return currentCount >= classroom.capaciteMax;
};

export const getAvailableSpace = (classroom: Classroom): number => {
  const currentCount = classroom._count?.students || 0;
  return Math.max(0, classroom.capaciteMax - currentCount);
};

export const getOccupancyColor = (
  percentage: number
): NonNullable<VariantProps<typeof badgeVariants>["variant"]> => {
  if (percentage >= 100) return 'destructive';
  if (percentage >= 90) return 'default';
  if (percentage >= 70) return 'secondary';
  return 'outline';
};

export const formatClassroomName = (classroom: Classroom): string => {
  let name = classroom.nom;
  if (classroom.numero) {
    name += ` ${classroom.numero}`;
  }
  if (classroom.batiment) {
    name += ` (${classroom.batiment}`;
    if (classroom.etage) {
      name += `, ${classroom.etage}e étage`;
    }
    name += ')';
  }
  return name;
};