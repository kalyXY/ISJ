'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getClassroomById,
  getStudentsInClassroom,
  removeStudentFromClassroom,
  calculateOccupancyRate,
  isClassroomFull,
  getAvailableSpace,
  getOccupancyColor,
  formatClassroomName,
  type Classroom
} from '@/services/classrooms';
import { type Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Edit,
  UserPlus,
  UserMinus,
  Users,
  Search,
  Building2,
  MapPin,
  Calendar,
  School,
  Phone,
  User,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';

const ClassroomDetailPage = () => {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classroomData, studentsData] = await Promise.all([
        getClassroomById(classroomId),
        getStudentsInClassroom(classroomId)
      ]);
      
      setClassroom(classroomData);
      setStudents(studentsData);
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

  // Filtrer les étudiants
  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = !selectedGender || student.gender === selectedGender;

    return matchesSearch && matchesGender;
  });

  // Gérer la suppression d'un élève
  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    
    setIsRemoving(true);
    try {
      await removeStudentFromClassroom(studentToRemove.id, classroomId);
      toast.success(`${studentToRemove.firstName} ${studentToRemove.lastName} retiré(e) de la salle`);
      setStudentToRemove(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsRemoving(false);
    }
  };

  // Statistiques des étudiants
  const getStudentStats = () => {
    const totalStudents = students.length;
    const maleCount = students.filter(s => s.gender === 'M').length;
    const femaleCount = students.filter(s => s.gender === 'F').length;
    const classGroups = students.reduce((acc, student) => {
      if (student.class) {
        acc[student.class] = (acc[student.class] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStudents,
      maleCount,
      femaleCount,
      classGroups
    };
  };

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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
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
  const stats = getStudentStats();

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
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span>{formatClassroomName(classroom)}</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Détails de la salle de classe et élèves assignés
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push(`/admin/salles/${classroom.id}/assign`)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assigner des élèves
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/admin/salles')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Nom :</span>
              <span className="font-medium">{classroom.nom}</span>
            </div>
            
            {classroom.numero && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Numéro :</span>
                <span className="font-medium">{classroom.numero}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Capacité max :</span>
              <Badge variant="outline" className="font-medium">
                {classroom.capaciteMax} places
              </Badge>
            </div>
            
            {classroom.batiment && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Bâtiment :</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{classroom.batiment}</span>
                </div>
              </div>
            )}
            
            {classroom.etage && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Étage :</span>
                <span className="font-medium">{classroom.etage}e étage</span>
              </div>
            )}
            
            {classroom.classe && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Classe assignée :</span>
                <div className="flex items-center gap-1">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{classroom.classe.nom}</span>
                </div>
              </div>
            )}
            
            {classroom.description && (
              <div className="pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground block mb-2">Description :</span>
                <p className="text-sm text-muted-foreground">{classroom.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques d'occupation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Occupation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Élèves présents :</span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg text-primary">
                  {stats.totalStudents}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Taux d'occupation :</span>
              <Badge variant={getOccupancyColor(occupancyRate)}>
                {occupancyRate}%
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Places libres :</span>
              <span className={`font-medium ${availableSpace === 0 ? 'text-red-600' : 'text-green-600'}`}>
                {availableSpace}
              </span>
            </div>
            
            {isFull && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Salle pleine</span>
                </div>
              </div>
            )}
            
            {!isFull && availableSpace <= 5 && (
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Capacité bientôt atteinte</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques des étudiants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Répartition des élèves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Garçons :</span>
              <Badge variant="secondary">
                {stats.maleCount} ({stats.totalStudents > 0 ? Math.round((stats.maleCount / stats.totalStudents) * 100) : 0}%)
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Filles :</span>
              <Badge variant="secondary">
                {stats.femaleCount} ({stats.totalStudents > 0 ? Math.round((stats.femaleCount / stats.totalStudents) * 100) : 0}%)
              </Badge>
            </div>
            
            {Object.keys(stats.classGroups).length > 0 && (
              <div className="pt-2 border-t">
                <span className="text-sm font-medium text-muted-foreground block mb-2">Par classe :</span>
                <div className="space-y-2">
                  {Object.entries(stats.classGroups).map(([className, count]) => (
                    <div key={className} className="flex justify-between items-center">
                      <span className="text-sm">{className} :</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Liste des élèves */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Élèves assignés ({filteredStudents.length})
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Rapport
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les genres</SelectItem>
                <SelectItem value="M">Masculin</SelectItem>
                <SelectItem value="F">Féminin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des élèves */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {students.length === 0 
                  ? "Aucun élève assigné à cette salle"
                  : "Aucun élève ne correspond aux filtres"
                }
              </p>
              {students.length === 0 && (
                <Button 
                  onClick={() => router.push(`/admin/salles/${classroom.id}/assign`)}
                  className="mt-4"
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assigner des élèves
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Classe</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Contact Parent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            {student.birthDate && (
                              <div className="text-sm text-muted-foreground">
                                {formatDate(student.birthDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {student.matricule || 'N/A'}
                        </code>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="secondary">
                          {student.class || 'Non définie'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={student.gender === 'M' ? 'default' : 'secondary'}>
                          {student.gender === 'M' ? 'Masculin' : 'Féminin'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        {student.parentPhone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{student.parentPhone}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non renseigné</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStudentToRemove(student)}
                          className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informations techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de la salle :</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{classroom.id}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le :</span>
                <span>{formatDate(classroom.createdAt)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Classe ID :</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {classroom.classeId || 'N/A'}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifiée le :</span>
                <span>{formatDate(classroom.updatedAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog 
        open={!!studentToRemove} 
        onOpenChange={() => setStudentToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir retirer{' '}
              <span className="font-semibold">
                {studentToRemove?.firstName} {studentToRemove?.lastName}
              </span>{' '}
              de cette salle ?
              <br /><br />
              L'élève sera retiré de la salle mais ne sera pas supprimé du système.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isRemoving ? 'Suppression...' : 'Retirer de la salle'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassroomDetailPage;