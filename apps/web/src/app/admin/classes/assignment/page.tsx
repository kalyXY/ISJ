'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { School, User, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import {
  getSallesByClass,
  getStudentsByClass,
  assignStudentsToSalle,
  unassignStudentsFromSalle,
  Salle,
  StudentForAssignment,
} from '@/services/assignment';
import { getAllClasses, Classe } from '@/services/academics';

const ClassAssignmentPage = () => {
  // State
  const [logicalClasses, setLogicalClasses] = useState<Classe[]>([]);
  const [students, setStudents] = useState<StudentForAssignment[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  const [selectedLogicalClassId, setSelectedLogicalClassId] = useState<string | null>(null);
  const [selectedSalleCode, setSelectedSalleCode] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const [loading, setLoading] = useState({
    classes: true,
    students: false,
    salles: false,
    assignment: false,
  });

  // Fetch initial logical classes (classes without a specific 'salle')
  const fetchLogicalClasses = useCallback(async () => {
    setLoading(prev => ({ ...prev, classes: true }));
    try {
      // Fetch all classes and filter on the frontend for "logical" ones (those without a salle)
      const all_classes = await getAllClasses();
      const logical = all_classes.filter(c => !c.salle);
      setLogicalClasses(logical);
    } catch (error) {
      toast.error('Erreur lors du chargement des classes logiques.');
    } finally {
      setLoading(prev => ({ ...prev, classes: false }));
    }
  }, []);

  useEffect(() => {
    fetchLogicalClasses();
  }, [fetchLogicalClasses]);

  // Fetch students and salles when a logical class is selected
  useEffect(() => {
    if (!selectedLogicalClassId) {
      setStudents([]);
      setSalles([]);
      return;
    }

    const fetchDataForClass = async () => {
      setLoading(prev => ({ ...prev, students: true, salles: true }));
      try {
        const [studentsData, sallesData] = await Promise.all([
          getStudentsByClass(selectedLogicalClassId),
          getSallesByClass(selectedLogicalClassId),
        ]);
        setStudents(studentsData);
        setSalles(sallesData);
      } catch (error) {
        toast.error("Erreur lors du chargement des élèves ou des salles.");
      } finally {
        setLoading(prev => ({ ...prev, students: false, salles: false }));
      }
    };

    fetchDataForClass();
    setSelectedStudentIds([]);
    setSelectedSalleCode(null);
  }, [selectedLogicalClassId]);

  const handleAssign = async () => {
    if (!selectedLogicalClassId || !selectedSalleCode || selectedStudentIds.length === 0) {
      toast.warning('Veuillez sélectionner une classe, une salle et au moins un élève.');
      return;
    }
    setLoading(prev => ({ ...prev, assignment: true }));
    try {
      const payload = { studentIds: selectedStudentIds, salleCode: selectedSalleCode };
      const result = await assignStudentsToSalle(selectedLogicalClassId, payload);
      toast.success(result.message);
      // Refresh student list
      const updatedStudents = await getStudentsByClass(selectedLogicalClassId);
      setStudents(updatedStudents);
      setSelectedStudentIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'affectation.");
    } finally {
      setLoading(prev => ({ ...prev, assignment: false }));
    }
  };

  const handleUnassign = async () => {
    if (!selectedLogicalClassId || selectedStudentIds.length === 0) {
       toast.warning('Veuillez sélectionner une classe et au moins un élève.');
      return;
    }
    setLoading(prev => ({ ...prev, assignment: true }));
    try {
      const payload = { studentIds: selectedStudentIds };
      const result = await unassignStudentsFromSalle(selectedLogicalClassId, payload);
      toast.success(result.message);
      // Refresh student list
      const updatedStudents = await getStudentsByClass(selectedLogicalClassId);
      setStudents(updatedStudents);
      setSelectedStudentIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la désaffectation.");
    } finally {
      setLoading(prev => ({ ...prev, assignment: false }));
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedStudentIds(checked ? students.map(s => s.id) : []);
  };

  const toggleStudentSelection = (studentId: string, checked: boolean) => {
    setSelectedStudentIds(prev =>
      checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
    );
  };

  const selectedClass = useMemo(() => {
    return logicalClasses.find(c => c.id === selectedLogicalClassId);
  }, [selectedLogicalClassId, logicalClasses]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affectation aux Salles</h1>
          <p className="text-muted-foreground">
            Assignez des élèves à une salle au sein de leur classe.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de sélection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                1. Choisissez une Classe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedLogicalClassId} value={selectedLogicalClassId || ''}>
                <SelectTrigger disabled={loading.classes}>
                  <SelectValue placeholder={loading.classes ? "Chargement..." : "Sélectionner une classe"} />
                </SelectTrigger>
                <SelectContent>
                  {logicalClasses.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedLogicalClassId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="h-5 w-5" />
                  2. Choisissez une Salle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={setSelectedSalleCode} value={selectedSalleCode || ''}>
                  <SelectTrigger disabled={loading.salles}>
                    <SelectValue placeholder={loading.salles ? "Chargement..." : "Sélectionner une salle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {salles.map(salle => (
                      <SelectItem key={salle.salle} value={salle.salle}>
                        Salle {salle.salle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <div className="mt-4 flex flex-col space-y-2">
                   <Button onClick={handleAssign} disabled={loading.assignment || !selectedSalleCode || selectedStudentIds.length === 0}>
                     {loading.assignment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Affecter ({selectedStudentIds.length}) à cette salle
                   </Button>
                   <Button onClick={handleUnassign} variant="outline" disabled={loading.assignment || selectedStudentIds.length === 0}>
                     <Trash2 className="mr-2 h-4 w-4" />
                     Désaffecter la sélection ({selectedStudentIds.length})
                   </Button>
                 </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne de la liste des élèves */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                  <User className="h-5 w-5" />
                  <span>Élèves de la classe {selectedClass?.nom || '...'}</span>
                </div>
                <Badge variant="secondary">{students.length} élèves</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.students ? (
                 <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectedStudentIds.length === students.length && students.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Nom</TableHead>
                      <TableHead>Matricule</TableHead>
                      <TableHead className="text-right">Salle Actuelle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={(checked) => toggleStudentSelection(student.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.firstName} {student.lastName}</TableCell>
                        <TableCell>{student.matricule}</TableCell>
                        <TableCell className="text-right">
                          {student.salleCode ? (
                            <Badge variant="default">Salle {student.salleCode}</Badge>
                          ) : (
                            <Badge variant="outline">Non affecté</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClassAssignmentPage;