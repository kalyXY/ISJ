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
  }
};

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