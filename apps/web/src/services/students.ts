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

// Fonction server-side pour Next.js App Router (SSR/SSG)
export const getStudentsServer = async (params?: { page?: number; limit?: number; search?: string }): Promise<StudentPagination> => {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL || ''}/academics/eleves`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.append(key, String(value));
    });
  }
  const res = await fetch(url.toString(), {
    // Revalidation côté Next.js (ex: 60s)
    next: { revalidate: 60 },
    headers: {
      'Content-Type': 'application/json',
      // Ajouter l'authentification si besoin (ex: cookies, token)
    },
    // credentials: 'include', // si besoin
  });
  if (!res.ok) throw new Error('Erreur lors du chargement des élèves');
  return res.json();
}; 