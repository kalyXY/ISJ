import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { User, Trash2, Phone, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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
  parentPhone: string;
  birthDate: string;
  gender: string;
  section: string;
  option: string;
}

interface StudentListByClassProps {
  class: Class;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoveStudent: (classId: string, studentId: string) => void;
}

export const StudentListByClass = ({ class: classe, open, onOpenChange, onRemoveStudent }: StudentListByClassProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async () => {
    if (!classe.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/eleves/classe/${classe.id}`);
      const data = await response.json();
      
      if (data.success) {
        setStudents(data.data.eleves || []);
      } else {
        toast.error('Erreur lors du chargement des élèves');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && classe.id) {
      fetchStudents();
    }
  }, [open, classe.id]);

  const handleRemoveStudent = (studentId: string) => {
    onRemoveStudent(classe.id, studentId);
    // Mettre à jour la liste locale
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Élèves de la classe {classe.nom}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Informations de la classe */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Informations de la classe</span>
                {classe.isAtCapacity && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Capacité atteinte
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Nom :</span>
                  <p className="font-semibold">{classe.nom}</p>
                </div>
                {classe.salle && (
                  <div>
                    <span className="font-medium text-muted-foreground">Salle :</span>
                    <p className="font-semibold">{classe.salle}</p>
                  </div>
                )}
                {classe.section && (
                  <div>
                    <span className="font-medium text-muted-foreground">Section :</span>
                    <p className="font-semibold">{classe.section.nom}</p>
                  </div>
                )}
                {classe.option && (
                  <div>
                    <span className="font-medium text-muted-foreground">Option :</span>
                    <p className="font-semibold">{classe.option.nom}</p>
                  </div>
                )}
              </div>

              {classe.description && (
                <div>
                  <span className="font-medium text-muted-foreground">Description :</span>
                  <p className="mt-1">{classe.description}</p>
                </div>
              )}

              {/* Capacité */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Occupation de la classe</span>
                  <span className={getCapacityColor(classe.capacityPercentage)}>
                    {classe.studentsCount}/{classe.capaciteMaximale} élèves
                  </span>
                </div>
                
                <Progress value={classe.capacityPercentage} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {classe.capacityPercentage}% occupé
                  </Badge>
                  
                  {classe.availableSpots > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {classe.availableSpots} place{classe.availableSpots > 1 ? 's' : ''} libre{classe.availableSpots > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 font-medium">
                      Capacité atteinte
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liste des élèves */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Liste des élèves</span>
                <Badge variant="secondary">
                  {students.length} élève{students.length > 1 ? 's' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun élève dans cette classe</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student, index) => (
                    <Card key={student.id} className="hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <p className="font-semibold">
                                  {index + 1}. {student.firstName} {student.lastName}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {student.matricule}
                                </Badge>
                                <Badge 
                                  variant={student.gender === 'M' ? 'default' : 'secondary'} 
                                  className="text-xs"
                                >
                                  {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {student.parentPhone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <span>{student.parentPhone}</span>
                                  </div>
                                )}
                                
                                {student.section && (
                                  <span>Section: {student.section}</span>
                                )}
                                
                                {student.option && (
                                  <span>Option: {student.option}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              Retirer
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};