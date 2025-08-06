import axiosInstance from '@/lib/axiosInstance';
import { type Student } from '@/types/student';

export interface StudentPagination {
  data: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getStudents = async (params?: { page?: number; limit?: number; search?: string }): Promise<StudentPagination> => {
  const res = await axiosInstance.get('/academics/eleves', { params });
  return res.data;
};

export const getStudentById = async (id: string): Promise<Student> => {
  const res = await axiosInstance.get(`/academics/eleves/${id}`);
  return res.data.data;
};

export const createStudent = async (data: Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<Student> => {
  const res = await axiosInstance.post('/academics/eleves', data);
  return res.data.data;
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>>): Promise<Student> => {
  const res = await axiosInstance.put(`/academics/eleves/${id}`, data);
  return res.data.data;
};

export const archiveStudent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/eleves/${id}`);
};

// Générer les informations automatiques (promotion et matricule)
export const generateStudentInfo = async (section: string, option: string): Promise<{ promotion: string; matricule: string }> => {
  const res = await axiosInstance.post('/academics/eleves/generate-info', { section, option });
  return res.data.data;
}; 