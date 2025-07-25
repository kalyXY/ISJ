export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  class: string;
  promotion: string;
  matricule: string;
  parentPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  gender: 'M' | 'F';
  birthDate: string;
  class: string;
  promotion: string;
  matricule: string;
  parentPhone: string;
  isActive: boolean;
}

export interface StudentsResponse {
  students: Student[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
  filters: {
    classes: string[];
    promotions: string[];
  };
}

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  class?: string;
  promotion?: string;
  isActive?: boolean | null;
} 