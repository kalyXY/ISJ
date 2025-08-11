'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  School, 
  UserPlus,
  Settings,
  Eye,
  Trash2
} from 'lucide-react';
import { StudentAssignmentDialog } from '@/components/classes/student-assignment-dialog';
import { ClassManagementCard } from '@/components/classes/class-management-card';
import { StudentListByClass } from '@/components/classes/student-list-by-class';
import { ClassStatsCard } from '@/components/classes/class-stats-card';
import { API_URL, getAuthHeaders } from '@/config/api';

interface Class {
  id: string;
  nom: string;
  salle?: string;
  section?: { nom: string };
  option?: { nom: string };
  anneeScolaire: string;
  capaciteMaximale: number;
  description?: string;
  studentsCount: number;
  availableSpots: number;
  isAtCapacity: boolean;
  capacityPercentage: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  classe?: {
    id: string;
    nom: string;
  };
  parentPhone: string;
}

interface ClassStats {
  totalClasses: number;
  totalCapacity: number;
  totalStudents: number;
  availableSpots: number;
  occupancyPercentage: number;
}

const ClassAssignmentPage = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnneeScolaire, setSelectedAnneeScolaire] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [unassignedStudentsOnly, setUnassignedStudentsOnly] = useState(false);

  // États pour la gestion des années scolaires, sections, etc.
  const [anneesScolaires, setAnneesScolaires] = useState<string[]>([]);
  const [sections, setSections] = useState<Array<{id: string, nom: string}>>([]);

  const fetchClasses = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      const params = new URLSearchParams();
      if (selectedAnneeScolaire) params.append('anneeScolaire', selectedAnneeScolaire);
      if (selectedSection && selectedSection !== 'all') params.append('sectionId', selectedSection);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/academics/classes?${params.toString()}`, {
        headers,
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setClasses(data.data);
      } else {
        toast.error('Erreur lors du chargement des classes');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const fetchStudents = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (unassignedStudentsOnly) params.append('classeId', 'null');
      
      const response = await fetch(`${API_URL}/eleves?${params.toString()}`, {
        headers,
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data);
      } else {
        toast.error('Erreur lors du chargement des élèves');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      const params = new URLSearchParams();
      if (selectedAnneeScolaire) params.append('anneeScolaire', selectedAnneeScolaire);
      
      const response = await fetch(`${API_URL}/academics/classes/stats?${params.toString()}`, {
        headers,
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const fetchMetadata = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      // Récupérer les années scolaires
      const anneesResponse = await fetch(`${API_URL}/academics/annees`, {
        headers,
        credentials: 'include',
      });
      const anneesData = await anneesResponse.json();
      if (anneesData.success) {
        const years = anneesData.data.map((a: any) => a.nom);
        setAnneesScolaires(years);
        
        // Définir l'année courante par défaut
        const currentYear = anneesData.data.find((a: any) => a.actuelle);
        if (currentYear) {
          setSelectedAnneeScolaire(currentYear.nom);
        }
      }

      // Récupérer les sections
      const sectionsResponse = await fetch(`${API_URL}/academics/sections`, {
        headers,
        credentials: 'include',
      });
      const sectionsData = await sectionsResponse.json();
      if (sectionsData.success) {
        setSections(sectionsData.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métadonnées:', error);
    }
  };

  const handleAssignStudent = async (studentId: string, classId: string, forceAssignment = false) => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      const response = await fetch(`${API_URL}/eleves/add-to-classe`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          eleveId: studentId,
          classeId: classId,
          forceAssignment
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        await Promise.all([fetchClasses(), fetchStudents(), fetchStats()]);
        setAssignmentDialogOpen(false);
      } else if (response.status === 409) {
        // Conflits détectés
        const confirmForce = confirm(
          `Conflits détectés:\n${data.conflicts.join('\n')}\n\nForcer l'affectation ?`
        );
        
        if (confirmForce) {
          await handleAssignStudent(studentId, classId, true);
        }
      } else {
        toast.error(data.message || 'Erreur lors de l\'affectation');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const handleRemoveStudent = async (classId: string, studentId: string) => {
    if (!confirm('Retirer cet élève de la classe ?')) return;
    
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;
      const response = await fetch(`${API_URL}/academics/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        await Promise.all([fetchClasses(), fetchStudents(), fetchStats()]);
      } else {
        toast.error(data.message || 'Erreur lors du retrait');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    if (selectedAnneeScolaire) {
      setLoading(true);
      Promise.all([fetchClasses(), fetchStudents(), fetchStats()])
        .finally(() => setLoading(false));
    }
  }, [selectedAnneeScolaire, selectedSection, searchTerm, unassignedStudentsOnly]);

  const getCapacityBadgeVariant = (percentage: number) => {
    if (percentage >= 100) return 'destructive';
    if (percentage >= 80) return 'outline';
    return 'secondary';
  };

  const filteredStudents = students.filter(student => 
    unassignedStudentsOnly ? !student.classe : true
  );

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Affectation des élèves</h1>
          <p className="text-muted-foreground">
            Gérez l'affectation des élèves dans les salles de classe
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAssignmentDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Affecter un élève
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ClassStatsCard
            title="Classes totales"
            value={stats.totalClasses}
            icon={School}
            variant="default"
          />
          <ClassStatsCard
            title="Capacité totale"
            value={stats.totalCapacity}
            icon={Users}
            variant="default"
          />
          <ClassStatsCard
            title="Élèves inscrits"
            value={stats.totalStudents}
            icon={User}
            variant="default"
          />
          <ClassStatsCard
            title="Taux d'occupation"
            value={`${stats.occupancyPercentage}%`}
            icon={CheckCircle}
            variant={stats.occupancyPercentage > 90 ? "destructive" : "default"}
          />
        </div>
      )}

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Année scolaire</label>
              <Select value={selectedAnneeScolaire} onValueChange={setSelectedAnneeScolaire}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'année" />
                </SelectTrigger>
                <SelectContent>
                  {anneesScolaires.map((annee) => (
                    <SelectItem key={annee} value={annee}>
                      {annee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant={unassignedStudentsOnly ? "default" : "outline"}
                onClick={() => setUnassignedStudentsOnly(!unassignedStudentsOnly)}
                className="w-full"
              >
                {unassignedStudentsOnly ? "Tous les élèves" : "Élèves non affectés"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal */}
      <Tabs defaultValue="classes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="classes">Vue par classes</TabsTrigger>
          <TabsTrigger value="students">Vue par élèves</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classe) => (
                <ClassManagementCard
                  key={classe.id}
                  class={classe}
                  onViewStudents={() => setSelectedClass(classe)}
                  onAssignStudent={() => {
                    setSelectedClass(classe);
                    setAssignmentDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Liste des élèves</span>
                <Badge variant="secondary">
                  {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.matricule}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {student.classe ? (
                        <Badge variant="secondary">
                          {student.classe.nom}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Non affecté
                        </Badge>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Implémenter la vue détaillée de l'élève
                            toast.info('Vue détaillée à implémenter');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {!student.classe && (
                          <Button
                            size="sm"
                            onClick={() => setAssignmentDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                            Affecter
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'affectation */}
      <StudentAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        classes={classes}
        students={filteredStudents}
        selectedClass={selectedClass}
        onAssign={handleAssignStudent}
      />

      {/* Dialog de vue des élèves d'une classe */}
      {selectedClass && (
        <StudentListByClass
          class={selectedClass}
          open={!!selectedClass}
          onOpenChange={() => setSelectedClass(null)}
          onRemoveStudent={handleRemoveStudent}
        />
      )}
    </div>
  );
};

export default ClassAssignmentPage;