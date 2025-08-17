import axiosInstance from '@/lib/axiosInstance';

// Types pour les données académiques
export interface Classe {
  id: string;
  nom: string;
  salle?: string;
  sectionId?: string;
  optionId?: string;
  anneeScolaire: string;
  capaciteMaximale: number;
  description?: string;
  section?: {
    id: string;
    nom: string;
  };
  option?: {
    id: string;
    nom: string;
  };
  matieres?: Matiere[];
  students?: any[];
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
  classe?: {
    id: string;
    nom: string;
  };
  createdAt: string;
  updatedAt: string;
}

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

export interface AnneeScolaire {
  id: string;
  nom: string;
  debut: string;
  fin: string;
  actuelle: boolean;
  createdAt: string;
  updatedAt: string;
}

// Services pour les classes
export const classesService = {
  // Récupérer toutes les classes
  getAll: async (anneeScolaire?: string): Promise<Classe[]> => {
    const params = anneeScolaire ? { anneeScolaire } : {};
    const response = await axiosInstance.get('/academics/classes', { params });
    return response.data.data;
  },

  // Récupérer une classe par ID
  getById: async (id: string): Promise<Classe> => {
    const response = await axiosInstance.get(`/academics/classes/${id}`);
    return response.data.data;
  },

  // Récupérer les classes filtrées
  getFiltered: async (filters: {
    sectionId?: string;
    optionId?: string;
    anneeScolaire?: string;
  }): Promise<Classe[]> => {
    const response = await axiosInstance.get('/academics/classes/filter', { params: filters });
    return response.data.data;
  },

  // Récupérer les statistiques des classes
  getStats: async (anneeScolaire?: string): Promise<any> => {
    const params = anneeScolaire ? { anneeScolaire } : {};
    const response = await axiosInstance.get('/academics/classes/stats', { params });
    return response.data.data;
  }
};

// Services pour les matières
export const matieresService = {
  // Récupérer toutes les matières
  getAll: async (): Promise<Matiere[]> => {
    const response = await axiosInstance.get('/academics/matieres');
    return response.data.data;
  },

  // Récupérer les matières par classe
  getByClasse: async (classeId: string): Promise<Matiere[]> => {
    const response = await axiosInstance.get(`/academics/matieres/classe/${classeId}`);
    return response.data.data;
  },

  // Récupérer une matière par ID
  getById: async (id: string): Promise<Matiere> => {
    const response = await axiosInstance.get(`/academics/matieres/${id}`);
    return response.data.data;
  }
};

// Services pour les sections
export const sectionsService = {
  // Récupérer toutes les sections
  getAll: async (): Promise<Section[]> => {
    const response = await axiosInstance.get('/academics/sections');
    return response.data.data;
  },

  // Récupérer une section par ID
  getById: async (id: string): Promise<Section> => {
    const response = await axiosInstance.get(`/academics/sections/${id}`);
    return response.data.data;
  }
};

// Services pour les options
export const optionsService = {
  // Récupérer toutes les options
  getAll: async (): Promise<Option[]> => {
    const response = await axiosInstance.get('/academics/options');
    return response.data.data;
  },

  // Récupérer une option par ID
  getById: async (id: string): Promise<Option> => {
    const response = await axiosInstance.get(`/academics/options/${id}`);
    return response.data.data;
  }
};

// Services pour les années scolaires
export const anneesScolairesService = {
  // Récupérer toutes les années scolaires
  getAll: async (): Promise<AnneeScolaire[]> => {
    const response = await axiosInstance.get('/academics/annees');
    return response.data.data;
  },

  // Récupérer l'année scolaire courante
  getCourante: async (): Promise<AnneeScolaire> => {
    const response = await axiosInstance.get('/academics/annees/courante');
    return response.data.data;
  },

  // Récupérer une année scolaire par ID
  getById: async (id: string): Promise<AnneeScolaire> => {
    const response = await axiosInstance.get(`/academics/annees/${id}`);
    return response.data.data;
  },

  // Créer une nouvelle année scolaire
  create: async (data: Omit<AnneeScolaire, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnneeScolaire> => {
    const response = await axiosInstance.post('/academics/annees', data);
    return response.data.data;
  },

  // Mettre à jour une année scolaire
  update: async (id: string, data: Partial<AnneeScolaire>): Promise<AnneeScolaire> => {
    const response = await axiosInstance.put(`/academics/annees/${id}`, data);
    return response.data.data;
  },

  // Supprimer une année scolaire
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/academics/annees/${id}`);
  },

  // Définir une année scolaire comme courante
  setCourante: async (id: string): Promise<AnneeScolaire> => {
    const response = await axiosInstance.patch(`/academics/annees/${id}/courante`);
    return response.data.data;
  }
};

// Fonctions d'export pour compatibilité avec l'ancien code
export const getAnneesScolaires = anneesScolairesService.getAll;
export const createAnneeScolaire = anneesScolairesService.create;
export const updateAnneeScolaire = anneesScolairesService.update;
export const deleteAnneeScolaire = anneesScolairesService.delete;
export const setCurrentAnneeScolaire = anneesScolairesService.setCourante;
export const getAnneeScolareCourante = anneesScolairesService.getCourante;

// Service combiné pour les besoins du module bulletins
export const academicsService = {
  // Récupérer toutes les données nécessaires pour une classe
  getClasseCompleteData: async (classeId: string): Promise<{
    classe: Classe;
    matieres: Matiere[];
    students: any[];
  }> => {
    const [classe, matieres] = await Promise.all([
      classesService.getById(classeId),
      matieresService.getByClasse(classeId)
    ]);

    return {
      classe,
      matieres,
      students: classe.students || []
    };
  },

  // Récupérer les données de référence pour les filtres
  getReferenceData: async (): Promise<{
    classes: Classe[];
    sections: Section[];
    options: Option[];
    anneescolaires: AnneeScolaire[];
  }> => {
    const [classes, sections, options, anneescolaires] = await Promise.all([
      classesService.getAll(),
      sectionsService.getAll(),
      optionsService.getAll(),
      anneesScolairesService.getAll()
    ]);

    return {
      classes,
      sections,
      options,
      anneescolaires
    };
  }
};

// Exports individuels pour compatibilité avec les composants existants
export const getAllClasses = classesService.getAll;
export const getClasses = classesService.getAll;
export const getSections = sectionsService.getAll;
export const getOptions = optionsService.getAll;
export const getAllMatieres = matieresService.getAll;

// Fonctions CRUD pour les sections
export const createSection = async (data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
  const response = await axiosInstance.post('/academics/sections', data);
  return response.data.data;
};

export const updateSection = async (id: string, data: Partial<Section>): Promise<Section> => {
  const response = await axiosInstance.put(`/academics/sections/${id}`, data);
  return response.data.data;
};

export const deleteSection = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/sections/${id}`);
};

// Fonctions CRUD pour les classes
export const createClasse = async (data: Omit<Classe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Classe> => {
  const response = await axiosInstance.post('/academics/classes', data);
  return response.data.data;
};

export const updateClasse = async (id: string, data: Partial<Classe>): Promise<Classe> => {
  const response = await axiosInstance.put(`/academics/classes/${id}`, data);
  return response.data.data;
};

export const deleteClasse = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/classes/${id}`);
};

// Fonctions CRUD pour les matières
export const createMatiere = async (data: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt'>): Promise<Matiere> => {
  const response = await axiosInstance.post('/academics/matieres', data);
  return response.data.data;
};

export const updateMatiere = async (id: string, data: Partial<Matiere>): Promise<Matiere> => {
  const response = await axiosInstance.put(`/academics/matieres/${id}`, data);
  return response.data.data;
};

export const deleteMatiere = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/matieres/${id}`);
};

// Fonctions CRUD pour les options
export const createOption = async (data: Omit<Option, 'id' | 'createdAt' | 'updatedAt'>): Promise<Option> => {
  const response = await axiosInstance.post('/academics/options', data);
  return response.data.data;
};

export const updateOption = async (id: string, data: Partial<Option>): Promise<Option> => {
  const response = await axiosInstance.put(`/academics/options/${id}`, data);
  return response.data.data;
};

export const deleteOption = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/academics/options/${id}`);
}; 