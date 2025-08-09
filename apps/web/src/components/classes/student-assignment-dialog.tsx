import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface Class {
  id: string;
  nom: string;
  salle?: string;
  section?: { nom: string };
  option?: { nom: string };
  capaciteMaximale: number;
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

interface StudentAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: Class[];
  students: Student[];
  selectedClass?: Class | null;
  onAssign: (studentId: string, classId: string) => void;
}

export const StudentAssignmentDialog = ({
  open,
  onOpenChange,
  classes,
  students,
  selectedClass,
  onAssign
}: StudentAssignmentDialogProps) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(selectedClass?.id || '');
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  const handleAssign = () => {
    if (selectedStudentId && selectedClassId) {
      onAssign(selectedStudentId, selectedClassId);
      // Reset form
      setSelectedStudentId('');
      setSelectedClassId(selectedClass?.id || '');
      setStudentSearch('');
      setClassSearch('');
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const selectedClassForAssignment = classes.find(c => c.id === selectedClassId);

  // Filtrer les élèves selon la recherche et exclure ceux déjà dans la classe sélectionnée
  const filteredStudents = students.filter(student => {
    const matchesSearch = studentSearch === '' || 
      student.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.matricule.toLowerCase().includes(studentSearch.toLowerCase());
    
    const notInSelectedClass = !selectedClassId || student.classe?.id !== selectedClassId;
    
    return matchesSearch && notInSelectedClass;
  });

  // Filtrer les classes selon la recherche et exclure celles à capacité maximale
  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classSearch === '' ||
      classe.nom.toLowerCase().includes(classSearch.toLowerCase()) ||
      classe.salle?.toLowerCase().includes(classSearch.toLowerCase());
    
    return matchesSearch;
  });

  const canAssign = selectedStudentId && selectedClassId && selectedClassForAssignment && !selectedClassForAssignment.isAtCapacity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Affecter un élève à une classe</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Sélection de l'élève */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sélectionner un élève</Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {filteredStudents.map((student) => (
                <Card 
                  key={student.id}
                  className={`cursor-pointer transition-colors ${
                    selectedStudentId === student.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.matricule}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {student.classe ? (
                          <Badge variant="secondary" className="text-xs">
                            {student.classe.nom}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Non affecté
                          </Badge>
                        )}
                        
                        {selectedStudentId === student.id && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun élève trouvé
                </div>
              )}
            </div>
          </div>

          {/* Sélection de la classe */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sélectionner une classe</Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {filteredClasses.map((classe) => (
                <Card 
                  key={classe.id}
                  className={`cursor-pointer transition-colors ${
                    selectedClassId === classe.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  } ${classe.isAtCapacity ? 'opacity-50' : ''}`}
                  onClick={() => !classe.isAtCapacity && setSelectedClassId(classe.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm flex items-center gap-2">
                            {classe.nom}
                            {classe.salle && (
                              <Badge variant="outline" className="text-xs">
                                Salle {classe.salle}
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{classe.studentsCount}/{classe.capaciteMaximale}</span>
                            {classe.section && <span>• {classe.section.nom}</span>}
                            {classe.option && <span>• {classe.option.nom}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {classe.isAtCapacity ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">Complet</span>
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {classe.availableSpots} place{classe.availableSpots > 1 ? 's' : ''}
                          </Badge>
                        )}
                        
                        {selectedClassId === classe.id && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredClasses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune classe trouvée
                </div>
              )}
            </div>
          </div>

          {/* Résumé de l'affectation */}
          {selectedStudent && selectedClassForAssignment && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 text-blue-900">Résumé de l'affectation</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Élève :</span> {selectedStudent.firstName} {selectedStudent.lastName} ({selectedStudent.matricule})
                  </p>
                  <p>
                    <span className="font-medium">Classe :</span> {selectedClassForAssignment.nom}
                    {selectedClassForAssignment.salle && ` - Salle ${selectedClassForAssignment.salle}`}
                  </p>
                  {selectedStudent.classe && (
                    <p className="text-orange-600">
                      <span className="font-medium">⚠️ Changement :</span> de {selectedStudent.classe.nom} vers {selectedClassForAssignment.nom}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!canAssign}
          >
            Affecter l'élève
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};