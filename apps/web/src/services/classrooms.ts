import axiosInstance from '@/lib/axiosInstance';
import { Student } from '@/types/student';

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

  const response = await axiosInstance.get(`/classrooms?${params.toString()}`);
  return response.data.data;
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
  const response = await axiosInstance.get(`/classrooms/${id}`);
  return response.data.data;
};

export const createClassroom = async (data: ClassroomCreateData): Promise<Classroom> => {
  const response = await axiosInstance.post('/classrooms', data);
  return response.data.data;
};

export const updateClassroom = async (id: string, data: ClassroomUpdateData): Promise<Classroom> => {
  const response = await axiosInstance.put(`/classrooms/${id}`, data);
  return response.data.data;
};

export const deleteClassroom = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/classrooms/${id}`);
};

// API calls pour l'assignation d'élèves
export const assignStudentToClassroom = async (data: StudentAssignment): Promise<void> => {
  await axiosInstance.post('/classrooms/assign-student', data);
};

export const removeStudentFromClassroom = async (studentId: string, classroomId: string): Promise<void> => {
  await axiosInstance.delete(`/classrooms/${classroomId}/students/${studentId}`);
};

export const bulkAssignStudents = async (data: BulkAssignmentData): Promise<void> => {
  await axiosInstance.post('/classrooms/bulk-assign', data);
};

export const getStudentsInClassroom = async (classroomId: string): Promise<Student[]> => {
  const response = await axiosInstance.get(`/classrooms/${classroomId}/students`);
  return response.data.data;
};

export const getAvailableStudents = async (classroomId?: string): Promise<Student[]> => {
  const params = new URLSearchParams();
  if (classroomId) params.append('excludeClassroom', classroomId);
  
  const response = await axiosInstance.get(`/students/available?${params.toString()}`);
  return response.data.data;
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
  const response = await axiosInstance.post('/classrooms/check-conflicts', {
    studentId,
    classroomId
  });
  return response.data.data;
};

export const getClassroomCapacityInfo = async (classroomId: string): Promise<{
  capacity: number;
  currentCount: number;
  available: number;
  percentage: number;
}> => {
  const response = await axiosInstance.get(`/classrooms/${classroomId}/capacity`);
  return response.data.data;
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

export const getOccupancyColor = (percentage: number): string => {
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