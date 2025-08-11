'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getClassroomById,
  getStudentsInClassroom,
  getAvailableStudents,
  assignStudentToClassroom,
  removeStudentFromClassroom,
  bulkAssignStudents,
  checkAssignmentConflicts,
  calculateOccupancyRate,
  isClassroomFull,
  getAvailableSpace,
  formatClassroomName,
  type Classroom
} from '@/services/classrooms';
import { type Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft,
  UserPlus,
  UserMinus,
  Users,
  Search,
  AlertTriangle,
  CheckCircle,
  Building2,
  School,
  Calendar,
  MapPin,
  UserCheck,
  Filter,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import Spinner from '@/components/ui/spinner';
import { FilterSelect, ALL_VALUE } from '@/components/ui/filter-select';

const AssignStudentsPage = () => {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // États pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  
  // États pour la sélection multiple
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  
  // États pour les conflits
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    student?: Student;
    conflicts?: Array<{
      type: 'schedule' | 'capacity' | 'duplicate';
      message: string;
      classroomId?: string;
      classroomName?: string;
    }>;
  }>({ open: false });

  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classroomData, assignedData, availableData] = await Promise.all([
        getClassroomById(classroomId),
        getStudentsInClassroom(classroomId),
        getAvailableStudents(classroomId)
      ]);
      
      setClassroom(classroomData);
      setAssignedStudents(assignedData);
      setAvailableStudents(availableData);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
      router.push('/admin/salles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId) {
      fetchData();
    }
  }, [classroomId]);

  // Filtrer les étudiants disponibles
  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = !searchTerm || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = selectedGender === 'all' || student.gender === selectedGender;
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;

    return matchesSearch && matchesGender && matchesClass;
  });

  // Gérer l'assignation d'un élève
  const handleAssignStudent = async (student: Student) => {
    // Vérifier les conflits d'abord
    try {
      const conflictCheck = await checkAssignmentConflicts(student.id, classroomId);
      
      if (conflictCheck.hasConflict) {
        setConflictDialog({
          open: true,
          student,
          conflicts: conflictCheck.conflicts
        });
        return;
      }
      
      // Procéder à l'assignation si pas de conflit
      await proceedWithAssignment(student);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la vérification des conflits');
    }
  };

  // Procéder à l'assignation (après résolution des conflits)
  const proceedWithAssignment = async (student: Student) => {
    setSubmitting(true);
    try {
      await assignStudentToClassroom({
        studentId: student.id,
        classroomId
      });
      
      toast.success(`${student.firstName} ${student.lastName} assigné(e) avec succès`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation');
    } finally {
      setSubmitting(false);
    }
  };

  // Gérer la suppression d'un élève
  const handleRemoveStudent = async (student: Student) => {
    setSubmitting(true);
    try {
      await removeStudentFromClassroom(student.id, classroomId);
      toast.success(`${student.firstName} ${student.lastName} retiré(e) de la salle`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  // Gérer la sélection multiple
  const handleStudentSelection = (studentId: string, checked: boolean) => {
    const newSelection = new Set(selectedStudents);
    if (checked) {
      newSelection.add(studentId);
    } else {
      newSelection.delete(studentId);
    }
    setSelectedStudents(newSelection);
  };

  // Sélectionner/désélectionner tous
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredAvailableStudents.map(s => s.id));
      setSelectedStudents(allIds);
    } else {
      setSelectedStudents(new Set());
    }
  };

  // Assignation en masse
  const handleBulkAssign = async () => {
    if (selectedStudents.size === 0) return;
    
    setSubmitting(true);
    try {
      await bulkAssignStudents({
        classroomId,
        studentIds: Array.from(selectedStudents)
      });
      
      toast.success(`${selectedStudents.size} élève(s) assigné(s) avec succès`);
      setSelectedStudents(new Set());
      setShowBulkAssignDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'assignation en masse');
    } finally {
      setSubmitting(false);
    }
  };

  // Obtenir les classes uniques
  const uniqueClasses = Array.from(new Set(availableStudents.map(s => s.class).filter(Boolean)));

  if (loading || !classroom) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const occupancyRate = calculateOccupancyRate(classroom);
  const availableSpace = getAvailableSpace(classroom);
  const isFull = isClassroomFull(classroom);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/salles')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <span>Assigner des Élèves</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Gérez les assignations d'élèves pour {formatClassroomName(classroom)}
            </p>
          </div>
        </div>
      </div>

      {/* Informations de la salle */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Salle</p>
                <p className="font-semibold">{formatClassroomName(classroom)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Capacité</p>
                <p className="font-semibold">
                  {assignedStudents.length} / {classroom.capaciteMax}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <Badge variant={occupancyRate >= 100 ? 'destructive' : 'outline'}>
                  {occupancyRate}%
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Places libres</p>
                <p className="font-semibold text-orange-600">{availableSpace}</p>
              </div>
            </div>
          </div>
          
          {isFull && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Attention : Cette salle a atteint sa capacité maximale !
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Élèves disponibles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Élèves Disponibles ({filteredAvailableStudents.length})
              </CardTitle>
              
              {selectedStudents.size > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedStudents.size} sélectionné(s)
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => setShowBulkAssignDialog(true)}
                    disabled={isFull || submitting}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assigner
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedStudents(new Set())}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtres */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <FilterSelect
                  placeholder="Genre"
                  value={selectedGender}
                  onChange={setSelectedGender}
                  options={[
                    { value: 'M', label: 'Masculin' },
                    { value: 'F', label: 'Féminin' },
                  ]}
                  includeAllOption
                  allLabel="Tous"
                />
                
                <FilterSelect
                  placeholder="Classe"
                  value={selectedClass}
                  onChange={setSelectedClass}
                  options={uniqueClasses.map((className) => ({ value: className, label: className }))}
                  includeAllOption
                  allLabel="Toutes"
                />
              </div>
            </div>

            {/* Option sélection multiple */}
            {filteredAvailableStudents.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <Checkbox
                  id="select-all"
                  checked={selectedStudents.size === filteredAvailableStudents.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="text-sm">
                  Sélectionner tous ({filteredAvailableStudents.length})
                </Label>
              </div>
            )}

            {/* Liste des élèves */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAvailableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {availableStudents.length === 0 
                      ? "Aucun élève disponible"
                      : "Aucun élève ne correspond aux filtres"
                    }
                  </p>
                </div>
              ) : (
                filteredAvailableStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedStudents.has(student.id)}
                        onCheckedChange={(checked) => 
                          handleStudentSelection(student.id, checked as boolean)
                        }
                      />
                      <div>
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.matricule} • {student.class} • {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAssignStudent(student)}
                      disabled={isFull || submitting}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Élèves assignés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Élèves Assignés ({assignedStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assignedStudents.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Aucun élève assigné à cette salle
                  </p>
                </div>
              ) : (
                assignedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {student.matricule} • {student.class} • {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveStudent(student)}
                      disabled={submitting}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog d'assignation en masse */}
      <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Confirmer l'assignation en masse
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'assigner {selectedStudents.size} élève(s) à la salle{' '}
              <span className="font-semibold">{formatClassroomName(classroom)}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              {Array.from(selectedStudents).map(studentId => {
                const student = availableStudents.find(s => s.id === studentId);
                return student ? (
                  <div key={studentId} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>{student.firstName} {student.lastName}</span>
                    <span className="text-muted-foreground">({student.matricule})</span>
                  </div>
                ) : null;
              })}
            </div>
            
            {selectedStudents.size > availableSpace && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">
                    Attention : Vous essayez d'assigner plus d'élèves ({selectedStudents.size}) 
                    que d'places disponibles ({availableSpace}).
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkAssignDialog(false)}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleBulkAssign}
              disabled={submitting || selectedStudents.size > availableSpace}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Assignment...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assigner ({selectedStudents.size})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de gestion des conflits */}
      <AlertDialog open={conflictDialog.open} onOpenChange={(open) => setConflictDialog({...conflictDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Conflit détecté
            </AlertDialogTitle>
            <AlertDialogDescription>
              Des conflits ont été détectés pour l'assignation de{' '}
              <span className="font-semibold">
                {conflictDialog.student?.firstName} {conflictDialog.student?.lastName}
              </span> :
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-2">
            {conflictDialog.conflicts?.map((conflict, index) => (
              <div key={index} className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      {conflict.type === 'capacity' && 'Capacité dépassée'}
                      {conflict.type === 'duplicate' && 'Élève déjà assigné'}
                      {conflict.type === 'schedule' && 'Conflit d\'horaire'}
                    </p>
                    <p className="text-sm text-red-600">{conflict.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConflictDialog({open: false});
                if (conflictDialog.student) {
                  proceedWithAssignment(conflictDialog.student);
                }
              }}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Assignment...</span>
                </>
              ) : (
                'Forcer l\'assignation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AssignStudentsPage;