import axiosInstance from '@/lib/axiosInstance';

// Types pour les périodes
export interface Periode {
  id: string;
  nom: string;
  type: 'trimestre' | 'semestre';
  dateDebut: string;
  dateFin: string;
  anneeScolaireId: string;
  isActive: boolean;
  isValidated: boolean;
  createdAt: string;
  updatedAt: string;
  anneeScolaire?: {
    id: string;
    nom: string;
    debut: string;
    fin: string;
    actuelle: boolean;
  };
  _count?: {
    notes: number;
    bulletins: number;
  };
}

// Types pour les notes
export interface Note {
  id: string;
  valeur: number;
  studentId: string;
  matiereId: string;
  periodeId: string;
  enseignantId: string;
  typeEvaluation: 'note_normale' | 'interrogation' | 'examen' | 'devoir';
  coefficient: number;
  appreciation?: string;
  isValidated: boolean;
  dateValidation?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
  };
  matiere?: {
    id: string;
    nom: string;
  };
  periode?: {
    id: string;
    nom: string;
    type: string;
    isValidated: boolean;
  };
  enseignant?: {
    id: string;
    nom: string;
    email: string;
  };
}

// Types pour les bulletins
export interface Bulletin {
  id: string;
  studentId: string;
  periodeId: string;
  classeId: string;
  moyenneGenerale?: number;
  rangClasse?: number;
  appreciationGenerale?: string;
  isGenerated: boolean;
  dateGeneration?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    matricule: string;
  };
  periode?: {
    id: string;
    nom: string;
    type: string;
  };
  classe?: {
    id: string;
    nom: string;
  };
}

// Types pour les paramètres
export interface ParametreEcole {
  id: string;
  cle: string;
  valeur: string;
  type: 'number' | 'string' | 'boolean';
  description?: string;
  createdAt: string;
  updatedAt: string;
  valeurConvertie?: any;
}

// Types pour les statistiques
export interface StatistiquesClasse {
  classe: {
    id: string;
    nom: string;
    section?: { nom: string };
    option?: { nom: string };
  };
  periode: {
    id: string;
    nom: string;
  };
  statistiques: {
    nombreEleves: number;
    moyenneClasse: number;
    meilleureNote: number;
    plusBasseNote: number;
    mediane: number;
    repartition: {
      excellent: number;
      tresBien: number;
      bien: number;
      assezBien: number;
      insuffisant: number;
    };
    classement: Array<{
      rang: number;
      student: {
        firstName: string;
        lastName: string;
        matricule: string;
      };
      moyenne: number;
    }>;
  };
}

export interface StatistiquesMatiere {
  matiere: {
    id: string;
    nom: string;
  };
  nombreNotes: number;
  moyenne: number;
  meilleureNote: number;
  plusBasseNote: number;
  repartition: {
    excellent: number;
    tresBien: number;
    bien: number;
    assezBien: number;
    insuffisant: number;
  };
}

// Services pour les périodes
export const periodesService = {
  // Récupérer toutes les périodes
  getAll: async (anneeScolaireId?: string): Promise<Periode[]> => {
    const params = anneeScolaireId ? { anneeScolaireId } : {};
    const response = await axiosInstance.get('/api/academics/bulletins/periodes', { params });
    return response.data.data;
  },

  // Récupérer les périodes actives
  getActives: async (): Promise<Periode[]> => {
    const response = await axiosInstance.get('/api/academics/bulletins/periodes/actives');
    return response.data.data;
  },

  // Récupérer une période par ID
  getById: async (id: string): Promise<Periode> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/periodes/${id}`);
    return response.data.data;
  },

  // Créer une nouvelle période
  create: async (data: Omit<Periode, 'id' | 'createdAt' | 'updatedAt'>): Promise<Periode> => {
    const response = await axiosInstance.post('/api/academics/bulletins/periodes', data);
    return response.data.data;
  },

  // Mettre à jour une période
  update: async (id: string, data: Partial<Periode>): Promise<Periode> => {
    const response = await axiosInstance.put(`/api/academics/bulletins/periodes/${id}`, data);
    return response.data.data;
  },

  // Supprimer une période
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/academics/bulletins/periodes/${id}`);
  },

  // Valider une période
  validate: async (id: string): Promise<void> => {
    await axiosInstance.put(`/api/academics/bulletins/periodes/${id}/validate`);
  }
};

// Services pour les notes
export const notesService = {
  // Récupérer toutes les notes avec filtres
  getAll: async (filters?: {
    classeId?: string;
    matiereId?: string;
    periodeId?: string;
    studentId?: string;
    enseignantId?: string;
    isValidated?: boolean;
  }): Promise<Note[]> => {
    const response = await axiosInstance.get('/api/academics/bulletins/notes', { params: filters });
    return response.data.data;
  },

  // Récupérer les notes par classe et période
  getByClasseAndPeriode: async (classeId: string, periodeId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/notes/classe/${classeId}/periode/${periodeId}`);
    return response.data.data;
  },

  // Créer une nouvelle note
  create: async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'enseignantId'>): Promise<Note> => {
    const response = await axiosInstance.post('/api/academics/bulletins/notes', data);
    return response.data.data;
  },

  // Mettre à jour une note
  update: async (id: string, data: Partial<Note>): Promise<Note> => {
    const response = await axiosInstance.put(`/api/academics/bulletins/notes/${id}`, data);
    return response.data.data;
  },

  // Supprimer une note
  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/academics/bulletins/notes/${id}`);
  },

  // Calculer la moyenne d'un élève
  getMoyenneEleve: async (studentId: string, periodeId: string): Promise<any> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/moyennes/eleve/${studentId}/periode/${periodeId}`);
    return response.data.data;
  },

  // Récupérer l'historique d'une note
  getHistorique: async (noteId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/notes/${noteId}/historique`);
    return response.data.data;
  }
};

// Services pour les bulletins
export const bulletinsService = {
  // Récupérer tous les bulletins
  getAll: async (filters?: {
    classeId?: string;
    periodeId?: string;
    studentId?: string;
  }): Promise<Bulletin[]> => {
    const response = await axiosInstance.get('/api/academics/bulletins/bulletins', { params: filters });
    return response.data.data;
  },

  // Récupérer les détails d'un bulletin
  getDetails: async (studentId: string, periodeId: string): Promise<any> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/bulletins/details/${studentId}/${periodeId}`);
    return response.data.data;
  },

  // Générer un bulletin pour un élève
  generer: async (studentId: string, periodeId: string, appreciationGenerale?: string): Promise<any> => {
    const response = await axiosInstance.post(`/api/academics/bulletins/bulletins/generer/${studentId}/${periodeId}`, {
      appreciationGenerale
    });
    return response.data.data;
  },

  // Générer tous les bulletins d'une classe
  genererClasse: async (classeId: string, periodeId: string): Promise<any> => {
    const response = await axiosInstance.post(`/api/academics/bulletins/bulletins/generer-classe/${classeId}/${periodeId}`);
    return response.data.data;
  },

  // Mettre à jour l'appréciation d'un bulletin
  updateAppreciation: async (bulletinId: string, appreciationGenerale: string): Promise<Bulletin> => {
    const response = await axiosInstance.put(`/api/academics/bulletins/bulletins/${bulletinId}/appreciation`, {
      appreciationGenerale
    });
    return response.data.data;
  },

  // Télécharger un bulletin PDF
  downloadPDF: async (studentId: string, periodeId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/bulletins/pdf/${studentId}/${periodeId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Télécharger tous les bulletins d'une classe en PDF
  downloadClassePDF: async (classeId: string, periodeId: string): Promise<Blob> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/bulletins/pdf-classe/${classeId}/${periodeId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Services pour les statistiques
export const statistiquesService = {
  // Récupérer les statistiques d'une classe
  getStatistiquesClasse: async (classeId: string, periodeId: string): Promise<StatistiquesClasse> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/statistiques/classe/${classeId}/periode/${periodeId}`);
    return response.data.data;
  },

  // Récupérer les statistiques par matière
  getStatistiquesMatiere: async (classeId: string, periodeId: string, matiereId?: string): Promise<StatistiquesMatiere[]> => {
    const params = matiereId ? { matiereId } : {};
    const response = await axiosInstance.get(`/api/academics/bulletins/statistiques/matieres/${classeId}/${periodeId}`, {
      params
    });
    return response.data.data;
  }
};

// Services pour les paramètres
export const parametresService = {
  // Récupérer tous les paramètres
  getAll: async (): Promise<ParametreEcole[]> => {
    const response = await axiosInstance.get('/api/academics/bulletins/parametres');
    return response.data.data;
  },

  // Récupérer les paramètres de notation
  getParametresNotation: async (): Promise<any> => {
    const response = await axiosInstance.get('/api/academics/bulletins/parametres/notation');
    return response.data.data;
  },

  // Récupérer un paramètre par clé
  getByKey: async (cle: string): Promise<ParametreEcole> => {
    const response = await axiosInstance.get(`/api/academics/bulletins/parametres/${cle}`);
    return response.data.data;
  },

  // Créer ou mettre à jour un paramètre
  upsert: async (data: Omit<ParametreEcole, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParametreEcole> => {
    const response = await axiosInstance.post('/api/academics/bulletins/parametres', data);
    return response.data.data;
  },

  // Supprimer un paramètre
  delete: async (cle: string): Promise<void> => {
    await axiosInstance.delete(`/api/academics/bulletins/parametres/${cle}`);
  },

  // Initialiser les paramètres par défaut
  initialiser: async (): Promise<any> => {
    const response = await axiosInstance.post('/api/academics/bulletins/parametres/initialiser');
    return response.data.data;
  },

  // Mettre à jour plusieurs paramètres en lot
  updateLot: async (parametres: Array<Omit<ParametreEcole, 'id' | 'createdAt' | 'updatedAt'>>): Promise<any> => {
    const response = await axiosInstance.put('/api/academics/bulletins/parametres/lot', { parametres });
    return response.data.data;
  }
};

// Utilitaires
export const bulletinsUtils = {
  // Télécharger un fichier blob
  downloadBlob: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Formater une note avec appréciation
  formatNoteWithAppreciation: (note: number): { note: number; appreciation: string; color: string } => {
    let appreciation = '';
    let color = '';

    if (note >= 16) {
      appreciation = 'Excellent';
      color = 'text-green-600';
    } else if (note >= 14) {
      appreciation = 'Très bien';
      color = 'text-blue-600';
    } else if (note >= 12) {
      appreciation = 'Bien';
      color = 'text-indigo-600';
    } else if (note >= 10) {
      appreciation = 'Assez bien';
      color = 'text-yellow-600';
    } else if (note >= 8) {
      appreciation = 'Passable';
      color = 'text-orange-600';
    } else {
      appreciation = 'Insuffisant';
      color = 'text-red-600';
    }

    return { note, appreciation, color };
  }
};