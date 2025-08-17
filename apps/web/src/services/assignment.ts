import axiosInstance from '../lib/axiosInstance';

// --- Types / Interfaces ---

export interface Salle {
  id: string;
  salle: string;
  description?: string;
}

export interface StudentForAssignment {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  salleCode: string | null;
}

export interface AssignPayload {
  studentIds: string[];
  salleCode: string;
}

export interface UnassignPayload {
  studentIds: string[];
}

// --- Service Functions ---

/**
 * Récupère les salles disponibles pour une classe logique donnée.
 * @param classeId - L'ID de la classe logique.
 */
export const getSallesByClass = async (classeId: string): Promise<Salle[]> => {
  const response = await axiosInstance.get(`/academics/assignment/classes/${classeId}/salles`);
  return response.data.data;
};

/**
 * Récupère les élèves d'une classe logique.
 * @param classeId - L'ID de la classe logique.
 * @param unassigned - Si true, ne retourne que les élèves non affectés à une salle.
 */
export const getStudentsByClass = async (classeId: string, unassigned = false): Promise<StudentForAssignment[]> => {
  const params = new URLSearchParams();
  if (unassigned) {
    params.append('unassigned', 'true');
  }
  const response = await axiosInstance.get(`/academics/assignment/classes/${classeId}/students`, { params });
  return response.data.data;
};

/**
 * Affecte une liste d'élèves à une salle.
 * @param classeId - L'ID de la classe logique à laquelle les élèves et la salle appartiennent.
 * @param payload - Les données contenant les IDs des élèves et le code de la salle.
 */
export const assignStudentsToSalle = async (classeId: string, payload: AssignPayload): Promise<any> => {
  const response = await axiosInstance.post(`/academics/assignment/classes/${classeId}/assign-students`, payload);
  return response.data;
};

/**
 * Désaffecte une liste d'élèves de leur salle.
 * @param classeId - L'ID de la classe logique.
 * @param payload - Les données contenant les IDs des élèves.
 */
export const unassignStudentsFromSalle = async (classeId: string, payload: UnassignPayload): Promise<any> => {
  const response = await axiosInstance.post(`/academics/assignment/classes/${classeId}/unassign-students`, payload);
  return response.data;
};
