import axiosInstance from '@/lib/axiosInstance';
import { type Student } from '@/types/student';
import { NetworkService } from '@/lib/network';
import { OfflineStorageService } from '@/lib/storage';

export interface StudentPagination {
  data: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class StudentsOfflineService {
  private networkService: NetworkService;
  private storageService: OfflineStorageService;

  constructor() {
    this.networkService = NetworkService.getInstance();
    this.storageService = OfflineStorageService.getInstance();
  }

  public async getStudents(params?: { 
    page?: number; 
    limit?: number; 
    search?: string 
  }): Promise<StudentPagination> {
    try {
      // Tenter l'appel API normal
      const res = await axiosInstance.get('/academics/eleves', { params });
      
      // Mettre en cache les résultats en cas de succès
      if (res.data?.data) {
        await this.storageService.cacheStudents(res.data.data);
      }
      
      return res.data;
    } catch (error: any) {
      // En cas d'erreur réseau et mode offline, utiliser le cache
      if (!this.networkService.isOnline() || this.isNetworkError(error)) {
        const cachedStudents = await this.storageService.getCachedStudents();
        
        if (cachedStudents) {
          // Simuler la pagination avec les données cachées
          const page = params?.page || 1;
          const limit = params?.limit || 10;
          const search = params?.search?.toLowerCase();
          
          let filteredStudents = cachedStudents;
          
          // Appliquer le filtre de recherche si nécessaire
          if (search) {
            filteredStudents = cachedStudents.filter((student: any) =>
              student.nom?.toLowerCase().includes(search) ||
              student.prenom?.toLowerCase().includes(search) ||
              student.matricule?.toLowerCase().includes(search)
            );
          }
          
          const total = filteredStudents.length;
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedData = filteredStudents.slice(startIndex, endIndex);
          
          return {
            data: paginatedData,
            pagination: {
              total,
              page,
              limit,
              pages: Math.ceil(total / limit)
            }
          };
        }
      }
      
      throw error;
    }
  }

  public async getStudentById(id: string): Promise<Student> {
    try {
      const res = await axiosInstance.get(`/academics/eleves/${id}`);
      return res.data.data;
    } catch (error: any) {
      // En mode offline, chercher dans le cache
      if (!this.networkService.isOnline() || this.isNetworkError(error)) {
        const cachedStudents = await this.storageService.getCachedStudents();
        if (cachedStudents) {
          const student = cachedStudents.find((s: any) => s.id === id);
          if (student) {
            return student;
          }
        }
      }
      
      throw error;
    }
  }

  public async createStudent(
    data: Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<Student> {
    try {
      const res = await axiosInstance.post('/academics/eleves', data);
      
      // Invalider et rafraîchir le cache
      await this.invalidateStudentsCache();
      
      return res.data.data;
    } catch (error: any) {
      // En mode offline, l'opération sera mise en file d'attente automatiquement
      if (error.isOfflineHandled) {
        // Créer un student temporaire avec un ID généré
        const tempStudent: Student = {
          id: `temp-${Date.now()}`,
          matricule: `TEMP-${Date.now()}`,
          ...data,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Ajouter au cache local
        await this.addStudentToCache(tempStudent);
        
        return tempStudent;
      }
      
      throw error;
    }
  }

  public async updateStudent(
    id: string, 
    data: Partial<Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>>
  ): Promise<Student> {
    try {
      const res = await axiosInstance.put(`/academics/eleves/${id}`, data);
      
      // Mettre à jour le cache
      await this.updateStudentInCache(id, res.data.data);
      
      return res.data.data;
    } catch (error: any) {
      // En mode offline, l'opération sera mise en file d'attente automatiquement
      if (error.isOfflineHandled) {
        // Mettre à jour localement
        const updatedStudent = await this.updateStudentInCache(id, data);
        if (updatedStudent) {
          return updatedStudent;
        }
      }
      
      throw error;
    }
  }

  public async archiveStudent(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/academics/eleves/${id}`);
      
      // Supprimer du cache
      await this.removeStudentFromCache(id);
    } catch (error: any) {
      // En mode offline, l'opération sera mise en file d'attente automatiquement
      if (error.isOfflineHandled) {
        // Marquer comme supprimé localement
        await this.removeStudentFromCache(id);
        return;
      }
      
      throw error;
    }
  }

  public async generateStudentInfo(
    section: string, 
    option: string
  ): Promise<{ promotion: string; matricule: string }> {
    try {
      const res = await axiosInstance.post('/academics/eleves/generate-info', { section, option });
      return res.data.data;
    } catch (error: any) {
      // En mode offline, générer des valeurs temporaires
      if (!this.networkService.isOnline() || this.isNetworkError(error)) {
        return {
          promotion: `${section}${option}-${new Date().getFullYear()}`,
          matricule: `TEMP-${Date.now()}`
        };
      }
      
      throw error;
    }
  }

  // Méthodes utilitaires privées
  private isNetworkError(error: any): boolean {
    return error.code === 'NETWORK_ERROR' || 
           error.code === 'ECONNREFUSED' || 
           !error.response;
  }

  private async invalidateStudentsCache(): Promise<void> {
    await this.storageService.removeCachedData('students');
  }

  private async addStudentToCache(student: Student): Promise<void> {
    const cachedStudents = await this.storageService.getCachedStudents() || [];
    cachedStudents.push(student);
    await this.storageService.cacheStudents(cachedStudents);
  }

  private async updateStudentInCache(id: string, updates: any): Promise<Student | null> {
    const cachedStudents = await this.storageService.getCachedStudents();
    if (!cachedStudents) return null;

    const studentIndex = cachedStudents.findIndex((s: any) => s.id === id);
    if (studentIndex === -1) return null;

    const updatedStudent = {
      ...cachedStudents[studentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    cachedStudents[studentIndex] = updatedStudent;
    await this.storageService.cacheStudents(cachedStudents);

    return updatedStudent;
  }

  private async removeStudentFromCache(id: string): Promise<void> {
    const cachedStudents = await this.storageService.getCachedStudents();
    if (!cachedStudents) return;

    const filteredStudents = cachedStudents.filter((s: any) => s.id !== id);
    await this.storageService.cacheStudents(filteredStudents);
  }
}

// Export d'une instance singleton
export const studentsOfflineService = new StudentsOfflineService();

// Export des fonctions individuelles pour compatibilité
export const getStudents = (params?: { page?: number; limit?: number; search?: string }) => 
  studentsOfflineService.getStudents(params);

export const getStudentById = (id: string) => 
  studentsOfflineService.getStudentById(id);

export const createStudent = (data: Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>) => 
  studentsOfflineService.createStudent(data);

export const updateStudent = (id: string, data: Partial<Omit<Student, 'id' | 'matricule' | 'createdAt' | 'updatedAt' | 'isActive'>>) => 
  studentsOfflineService.updateStudent(id, data);

export const archiveStudent = (id: string) => 
  studentsOfflineService.archiveStudent(id);

export const generateStudentInfo = (section: string, option: string) => 
  studentsOfflineService.generateStudentInfo(section, option);