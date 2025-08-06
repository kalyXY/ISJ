export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  class: string;
  section?: string;
  option?: string;
  promotion: string;
  matricule: string;
  parentPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  classeId?: string;
  userId?: string;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  sectionId: string;
  optionId: string;
  classeId: string;
  promotion: string;
  matricule: string;
  parentPhone: string;
  isActive: boolean;
  userId?: string;
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