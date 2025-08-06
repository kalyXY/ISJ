import axiosInstance from '@/lib/axiosInstance';

export interface Enseignant {
  id: string;
  nom: string;
  email: string;
  classes: { id: string; nom: string }[];
  matieres: { id: string; nom: string }[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | null;
}

export const getEnseignants = async (): Promise<Enseignant[]> => {
  const res = await axiosInstance.get('/enseignants');
  return res.data.data;
};

export const createEnseignant = async (data: { userId: string }): Promise<Enseignant> => {
  const res = await axiosInstance.post('/enseignants', data);
  return res.data.data;
};

export const updateEnseignant = async (id: string, data: { nom: string; email: string }): Promise<Enseignant> => {
  const res = await axiosInstance.put(`/enseignants/${id}`, data);
  return res.data.data;
};

export const deleteEnseignant = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/enseignants/${id}`);
};

export const assignClasseMatiere = async (id: string, data: { classeIds: string[]; matiereIds: string[] }): Promise<Enseignant> => {
  const res = await axiosInstance.patch(`/enseignants/${id}/assign`, data);
  return res.data.data;
}; 

export interface UserTeacher {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export const getTeacherUsers = async (): Promise<UserTeacher[]> => {
  const res = await axiosInstance.get('/admin/users?role=teacher');
  return res.data.users;
}; 