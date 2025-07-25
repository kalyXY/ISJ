import axiosInstance from '@/lib/axiosInstance';

// Types
export interface Section {
  id: string;
  nom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Option {
  id: string;
  nom: string;
  createdAt: string;
  updatedAt: string;
}

export interface Classe {
  id: string;
  nom: string;
  sectionId: string;
  optionId?: string;
  anneeScolaire: string;
  section?: Section;
  option?: Option;
  _count?: {
    students: number;
    matieres: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Matiere {
  id: string;
  nom: string;
  classeId: string;
  classe?: Classe;
  createdAt: string;
  updatedAt: string;
}

export interface AnneeScolaire {
  id: string;
  nom: string;
  debut: string;
  fin: string;
  actuelle: boolean;
  createdAt: string;
  updatedAt: string;
}

// API calls for Sections
export const getSections = async (): Promise<Section[]> => {
  const response = await axiosInstance.get(`/academics/sections`);
  return response.data.data;
};

export const getSectionById = async (id: string): Promise<Section> => {
  const response = await axiosInstance.get(`/academics/sections/${id}`);
  return response.data.data;
};

export const createSection = async (data: { nom: string }): Promise<Section> => {
  const response = await axiosInstance.post(`/academics/sections`, data);
  return response.data.data;
};

export const updateSection = async (id: string, data: { nom: string }): Promise<Section> => {
  const response = await axiosInstance.put(`/academics/sections/${id}`, data);
  return response.data.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/sections/${id}`);
};

// API calls for Options
export const getOptions = async (): Promise<Option[]> => {
  const response = await axiosInstance.get(`/academics/options`);
  return response.data.data;
};

export const getOptionById = async (id: string): Promise<Option> => {
  const response = await axiosInstance.get(`/academics/options/${id}`);
  return response.data.data;
};

export const createOption = async (data: { nom: string }): Promise<Option> => {
  const response = await axiosInstance.post(`/academics/options`, data);
  return response.data.data;
};

export const updateOption = async (id: string, data: { nom: string }): Promise<Option> => {
  const response = await axiosInstance.put(`/academics/options/${id}`, data);
  return response.data.data;
};

export const deleteOption = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/options/${id}`);
};

// API calls for Classes
export const getClasses = async (): Promise<Classe[]> => {
  const response = await axiosInstance.get(`/academics/classes`);
  return response.data.data;
};

export const getClasseById = async (id: string): Promise<Classe> => {
  const response = await axiosInstance.get(`/academics/classes/${id}`);
  return response.data.data;
};

export const createClasse = async (data: { 
  nom: string;
  sectionId: string;
  optionId?: string;
  anneeScolaire: string;
}): Promise<Classe> => {
  const response = await axiosInstance.post(`/academics/classes`, data);
  return response.data.data;
};

export const updateClasse = async (id: string, data: { 
  nom: string;
  sectionId: string;
  optionId?: string;
  anneeScolaire: string;
}): Promise<Classe> => {
  const response = await axiosInstance.put(`/academics/classes/${id}`, data);
  return response.data.data;
};

export const deleteClasse = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/classes/${id}`);
};

// API calls for Matieres
export const getAllMatieres = async (): Promise<Matiere[]> => {
  const response = await axiosInstance.get(`/academics/matieres`);
  return response.data.data;
};

export const getMatieresByClasse = async (classeId: string): Promise<Matiere[]> => {
  const response = await axiosInstance.get(`/academics/matieres/classe/${classeId}`);
  return response.data.data;
};

export const getMatiereById = async (id: string): Promise<Matiere> => {
  const response = await axiosInstance.get(`/academics/matieres/${id}`);
  return response.data.data;
};

export const createMatiere = async (data: { 
  nom: string;
  classeId: string;
}): Promise<Matiere> => {
  const response = await axiosInstance.post(`/academics/matieres`, data);
  return response.data.data;
};

export const updateMatiere = async (id: string, data: { 
  nom: string;
  classeId: string;
}): Promise<Matiere> => {
  const response = await axiosInstance.put(`/academics/matieres/${id}`, data);
  return response.data.data;
};

export const deleteMatiere = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/matieres/${id}`);
};

// API calls for Années Scolaires
export const getAnneesScolaires = async (): Promise<AnneeScolaire[]> => {
  const response = await axiosInstance.get(`/academics/annees`);
  return response.data.data;
};

export const getAnneeScolareCourante = async (): Promise<AnneeScolaire> => {
  const response = await axiosInstance.get(`/academics/annees/courante`);
  return response.data.data;
};

export const getAnneeScolaireById = async (id: string): Promise<AnneeScolaire> => {
  const response = await axiosInstance.get(`/academics/annees/${id}`);
  return response.data.data;
};

export const createAnneeScolaire = async (data: {
  nom: string;
  debut: string;
  fin: string;
  actuelle?: boolean;
}): Promise<AnneeScolaire> => {
  const response = await axiosInstance.post(`/academics/annees`, data);
  return response.data.data;
};

export const updateAnneeScolaire = async (id: string, data: {
  nom: string;
  debut: string;
  fin: string;
  actuelle?: boolean;
}): Promise<AnneeScolaire> => {
  const response = await axiosInstance.put(`/academics/annees/${id}`, data);
  return response.data.data;
};

export const deleteAnneeScolaire = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/annees/${id}`);
};

export const setCurrentAnneeScolaire = async (id: string): Promise<AnneeScolaire> => {
  const response = await axiosInstance.put(`/academics/annees/${id}/setCurrent`, {});
  return response.data.data;
}; 