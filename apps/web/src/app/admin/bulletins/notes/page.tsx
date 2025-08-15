'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Plus, Edit, Save, Filter, Users, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { notesService, periodesService, type Note, type Periode } from '@/services/bulletins';
import { classesService, matieresService, type Classe, type Matiere } from '@/services/academics';

const NotesPage = () => {
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedPeriode, setSelectedPeriode] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    valeur: '',
    typeEvaluation: 'note_normale',
    coefficient: 1,
    appreciation: ''
  });

  // États pour les données de référence
  const [classes, setClasses] = useState<Classe[]>([]);
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const fetchReferenceData = async () => {
    try {
      // Récupérer les périodes actives et les classes
      const [periodesData, classesData] = await Promise.all([
        periodesService.getActives(),
        classesService.getAll()
      ]);
      setPeriodes(periodesData);
      setClasses(classesData);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des données de référence');
    }
  };

  const fetchMatieresAndStudents = async (classeId: string) => {
    try {
      const [matieresData, classeData] = await Promise.all([
        matieresService.getByClasse(classeId),
        classesService.getById(classeId)
      ]);
      setMatieres(matieresData);
      setStudents(classeData.students || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des matières et étudiants');
    }
  };

  const fetchNotes = async () => {
    if (!selectedClasse || !selectedPeriode) return;
    
    setLoading(true);
    try {
      const data = await notesService.getByClasseAndPeriode(selectedClasse, selectedPeriode);
      setNotes(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    if (selectedClasse) {
      fetchMatieresAndStudents(selectedClasse);
    }
  }, [selectedClasse]);

  useEffect(() => {
    if (selectedClasse && selectedPeriode) {
      fetchNotes();
    }
  }, [selectedClasse, selectedPeriode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        valeur: parseFloat(formData.valeur),
        studentId: selectedStudent.id,
        matiereId: selectedMatiere,
        periodeId: selectedPeriode
      };

      await notesService.create(noteData);
      toast.success('Note ajoutée avec succès');
      setDialogOpen(false);
      resetForm();
      fetchNotes();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'ajout de la note');
    }
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setFormData({
      valeur: '',
      typeEvaluation: 'note_normale',
      coefficient: 1,
      appreciation: ''
    });
  };

  const openDialog = (student: any) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const getNoteMoyenne = (studentId: string, matiereId: string) => {
    const notesEleve = notes.filter(n => n.studentId === studentId && n.matiereId === matiereId);
    if (notesEleve.length === 0) return null;
    
    const total = notesEleve.reduce((sum, note) => sum + (note.valeur * note.coefficient), 0);
    const totalCoeff = notesEleve.reduce((sum, note) => sum + note.coefficient, 0);
    
    return totalCoeff > 0 ? (total / totalCoeff).toFixed(2) : null;
  };

  const getNoteColor = (note: number) => {
    if (note >= 16) return 'text-green-600';
    if (note >= 14) return 'text-blue-600';
    if (note >= 12) return 'text-indigo-600';
    if (note >= 10) return 'text-yellow-600';
    if (note >= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Saisie des Notes</h1>
        <p className="text-muted-foreground">
          Saisissez et gérez les notes des élèves par classe et par période
        </p>
      </div>

      {/* Filtres de sélection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Sélection</span>
          </CardTitle>
          <CardDescription>
            Choisissez la classe, la période et la matière pour commencer la saisie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  {periodes.map((periode) => (
                    <SelectItem key={periode.id} value={periode.id}>
                      {periode.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Matière</Label>
              <Select value={selectedMatiere} onValueChange={setSelectedMatiere}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>
                      {matiere.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des notes */}
      {selectedClasse && selectedPeriode && selectedMatiere && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Saisie des notes</span>
            </CardTitle>
            <CardDescription>
              Cliquez sur un élève pour ajouter ou modifier ses notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Chargement des notes...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Élève</TableHead>
                    <TableHead>Matricule</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Moyenne</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const notesEleve = notes.filter(n => n.studentId === student.id && n.matiereId === selectedMatiere);
                    const moyenne = getNoteMoyenne(student.id, selectedMatiere);
                    
                    return (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openDialog(student)}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.matricule}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {notesEleve.map((note) => (
                              <Badge key={note.id} variant="outline" className={getNoteColor(note.valeur)}>
                                {note.valeur}/20
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {moyenne && (
                            <Badge variant="default" className={getNoteColor(parseFloat(moyenne))}>
                              {moyenne}/20
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); openDialog(student); }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de saisie de note */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Ajouter une note
            </DialogTitle>
            <DialogDescription>
              {selectedStudent && `Saisissez une note pour ${selectedStudent.firstName} ${selectedStudent.lastName}`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valeur">Note (/20)</Label>
                <Input
                  id="valeur"
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: e.target.value })}
                  placeholder="Ex: 15.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coefficient">Coefficient</Label>
                <Input
                  id="coefficient"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.coefficient}
                  onChange={(e) => setFormData({ ...formData, coefficient: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeEvaluation">Type d'évaluation</Label>
              <Select value={formData.typeEvaluation} onValueChange={(value) => setFormData({ ...formData, typeEvaluation: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note_normale">Note normale</SelectItem>
                  <SelectItem value="interrogation">Interrogation</SelectItem>
                  <SelectItem value="examen">Examen</SelectItem>
                  <SelectItem value="devoir">Devoir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="appreciation">Appréciation (optionnel)</Label>
              <Textarea
                id="appreciation"
                value={formData.appreciation}
                onChange={(e) => setFormData({ ...formData, appreciation: e.target.value })}
                placeholder="Commentaire sur la note..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* État vide */}
      {!selectedClasse || !selectedPeriode || !selectedMatiere ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sélection requise</h3>
            <p className="text-muted-foreground">
              Veuillez sélectionner une classe, une période et une matière pour commencer la saisie des notes.
            </p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default NotesPage;