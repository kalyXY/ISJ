'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getClassrooms,
  createClassroom,
  updateClassroom,
  deleteClassroom,
  getClassroomCapacityInfo,
  calculateOccupancyRate,
  isClassroomFull,
  getAvailableSpace,
  getOccupancyColor,
  formatClassroomName,
  type Classroom,
  type ClassroomCreateData,
  type ClassroomFilters
} from '@/services/classrooms';
import { getClasses, type Classe } from '@/services/academics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  UserPlus,
  AlertTriangle,
  MapPin,
  School,
  Hash,
  Home,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';
import Spinner from '@/components/ui/spinner';

// Schéma de validation pour les salles de classe
const classroomSchema = z.object({
  nom: z.string().min(1, 'Le nom de la salle est requis'),
  numero: z.string().optional(),
  capaciteMax: z.number().min(1, 'La capacité doit être au moins de 1').max(200, 'La capacité ne peut pas dépasser 200'),
  description: z.string().optional(),
  batiment: z.string().optional(),
  etage: z.number().min(0, 'L\'étage ne peut pas être négatif').max(20, 'L\'étage ne peut pas dépasser 20').optional().nullable(),
  classeId: z.string().optional(),
});

type ClassroomFormData = z.infer<typeof classroomSchema>;

const ClassroomsAdminPage = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatiment, setSelectedBatiment] = useState<string>('');
  const [selectedClasse, setSelectedClasse] = useState<string>('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
  // États pour les dialogues
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ClassroomFormData>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      nom: '',
      numero: '',
      capaciteMax: 30,
      description: '',
      batiment: '',
      etage: undefined,
      classeId: '',
    }
  });

  // Charger les données
  const fetchData = async () => {
    setLoading(true);
    try {
      const [classroomsData, classesData] = await Promise.all([
        getClassrooms(),
        getClasses()
      ]);
      setClassrooms(classroomsData);
      setClasses(classesData);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrer les salles de classe
  const filteredClassrooms = classrooms.filter(classroom => {
    const matchesSearch = !searchTerm || 
      classroom.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classroom.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatiment = !selectedBatiment || classroom.batiment === selectedBatiment;
    const matchesClasse = !selectedClasse || classroom.classeId === selectedClasse;
    const matchesAvailable = !showAvailableOnly || !isClassroomFull(classroom);

    return matchesSearch && matchesBatiment && matchesClasse && matchesAvailable;
  });

  // Gérer la création
  const handleCreate = () => {
    reset({
      nom: '',
      numero: '',
      capaciteMax: 30,
      description: '',
      batiment: '',
      etage: undefined,
      classeId: '',
    });
    setSelectedClassroom(null);
    setIsCreateDialogOpen(true);
  };

  // Gérer l'édition
  const handleEdit = (classroom: Classroom) => {
    reset({
      nom: classroom.nom,
      numero: classroom.numero || '',
      capaciteMax: classroom.capaciteMax,
      description: classroom.description || '',
      batiment: classroom.batiment || '',
      etage: classroom.etage || undefined,
      classeId: classroom.classeId || '',
    });
    setSelectedClassroom(classroom);
    setIsEditDialogOpen(true);
  };

  // Gérer la suppression
  const handleDelete = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsDeleteDialogOpen(true);
  };

  // Gérer la visualisation
  const handleView = (classroom: Classroom) => {
    router.push(`/admin/salles/${classroom.id}`);
  };

  // Gérer l'assignation d'élèves
  const handleAssignStudents = (classroom: Classroom) => {
    router.push(`/admin/salles/${classroom.id}/assign`);
  };

  // Soumettre le formulaire
  const onSubmit = async (data: ClassroomFormData) => {
    setIsSubmitting(true);
    try {
      // Nettoyer les données
      const cleanedData = {
        ...data,
        numero: data.numero || undefined,
        description: data.description || undefined,
        batiment: data.batiment || undefined,
        etage: data.etage || undefined,
        classeId: data.classeId || undefined,
      };

      if (selectedClassroom) {
        await updateClassroom(selectedClassroom.id, cleanedData);
        toast.success('Salle de classe mise à jour avec succès');
        setIsEditDialogOpen(false);
      } else {
        await createClassroom(cleanedData);
        toast.success('Salle de classe créée avec succès');
        setIsCreateDialogOpen(false);
      }
      
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmer la suppression
  const confirmDelete = async () => {
    if (!selectedClassroom) return;
    
    setIsSubmitting(true);
    try {
      await deleteClassroom(selectedClassroom.id);
      toast.success('Salle de classe supprimée avec succès');
      setIsDeleteDialogOpen(false);
      setSelectedClassroom(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Obtenir les bâtiments uniques
  const uniqueBuildings = Array.from(new Set(classrooms.map(c => c.batiment).filter(Boolean)));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <span>Gestion des Salles de Classe</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Gérez les salles de classe et assignez des élèves
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Créer une salle
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Salles</p>
                <p className="text-2xl font-bold">{classrooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Élèves Assignés</p>
                <p className="text-2xl font-bold">
                  {classrooms.reduce((sum, c) => sum + (c._count?.students || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salles Pleines</p>
                <p className="text-2xl font-bold">
                  {classrooms.filter(c => isClassroomFull(c)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Home className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bâtiments</p>
                <p className="text-2xl font-bold">{uniqueBuildings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, numéro, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bâtiment</Label>
              <Select value={selectedBatiment} onValueChange={setSelectedBatiment}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les bâtiments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les bâtiments</SelectItem>
                  {uniqueBuildings.map(building => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Classe</Label>
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Toutes les classes</SelectItem>
                  {classes.map(classe => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Disponibilité</Label>
              <Button
                variant={showAvailableOnly ? "default" : "outline"}
                onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                className="w-full"
              >
                {showAvailableOnly ? "Avec places disponibles" : "Toutes les salles"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des salles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Salles de Classe ({filteredClassrooms.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClassrooms.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune salle trouvée</p>
              <Button onClick={handleCreate} className="mt-4" variant="outline">
                Créer votre première salle
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salle</TableHead>
                    <TableHead>Classe Assignée</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead className="text-center">Capacité</TableHead>
                    <TableHead className="text-center">Élèves</TableHead>
                    <TableHead className="text-center">Occupation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClassrooms.map((classroom) => {
                    const occupancyRate = calculateOccupancyRate(classroom);
                    const availableSpace = getAvailableSpace(classroom);
                    
                    return (
                      <TableRow key={classroom.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{formatClassroomName(classroom)}</div>
                            {classroom.description && (
                              <div className="text-xs text-muted-foreground">
                                {classroom.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {classroom.classe ? (
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4 text-muted-foreground" />
                              <span>{classroom.classe.nom}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Non assignée</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">
                              {classroom.batiment && (
                                <div>{classroom.batiment}</div>
                              )}
                              {classroom.etage && (
                                <div className="text-xs text-muted-foreground">
                                  {classroom.etage}e étage
                                </div>
                              )}
                              {!classroom.batiment && !classroom.etage && (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {classroom.capaciteMax}
                          </Badge>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {classroom._count?.students || 0}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <Badge variant={getOccupancyColor(occupancyRate)}>
                              {occupancyRate}%
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {availableSpace} places libres
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleView(classroom)}
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAssignStudents(classroom)}
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-600"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(classroom)}
                              className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(classroom)}
                              className="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Créer une salle de classe
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour créer une nouvelle salle de classe
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la salle <span className="text-red-500">*</span></Label>
                <Input
                  id="nom"
                  placeholder="Salle A, Laboratoire..."
                  {...register('nom')}
                  className={errors.nom ? 'border-destructive' : ''}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro</Label>
                <Input
                  id="numero"
                  placeholder="101, A1..."
                  {...register('numero')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capaciteMax">Capacité maximale <span className="text-red-500">*</span></Label>
                <Input
                  id="capaciteMax"
                  type="number"
                  min="1"
                  max="200"
                  {...register('capaciteMax', { valueAsNumber: true })}
                  className={errors.capaciteMax ? 'border-destructive' : ''}
                />
                {errors.capaciteMax && (
                  <p className="text-sm text-destructive">{errors.capaciteMax.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batiment">Bâtiment</Label>
                <Input
                  id="batiment"
                  placeholder="Bâtiment A, Principal..."
                  {...register('batiment')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="etage">Étage</Label>
                <Input
                  id="etage"
                  type="number"
                  min="0"
                  max="20"
                  {...register('etage', { valueAsNumber: true })}
                  className={errors.etage ? 'border-destructive' : ''}
                />
                {errors.etage && (
                  <p className="text-sm text-destructive">{errors.etage.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classeId">Classe assignée (optionnel)</Label>
              <Select onValueChange={(value) => setValue('classeId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune classe</SelectItem>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la salle, équipements disponibles..."
                rows={3}
                {...register('description')}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Création...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Modifier la salle de classe
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de la salle de classe
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la salle <span className="text-red-500">*</span></Label>
                <Input
                  id="nom"
                  placeholder="Salle A, Laboratoire..."
                  {...register('nom')}
                  className={errors.nom ? 'border-destructive' : ''}
                />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro</Label>
                <Input
                  id="numero"
                  placeholder="101, A1..."
                  {...register('numero')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capaciteMax">Capacité maximale <span className="text-red-500">*</span></Label>
                <Input
                  id="capaciteMax"
                  type="number"
                  min="1"
                  max="200"
                  {...register('capaciteMax', { valueAsNumber: true })}
                  className={errors.capaciteMax ? 'border-destructive' : ''}
                />
                {errors.capaciteMax && (
                  <p className="text-sm text-destructive">{errors.capaciteMax.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batiment">Bâtiment</Label>
                <Input
                  id="batiment"
                  placeholder="Bâtiment A, Principal..."
                  {...register('batiment')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="etage">Étage</Label>
                <Input
                  id="etage"
                  type="number"
                  min="0"
                  max="20"
                  {...register('etage', { valueAsNumber: true })}
                  className={errors.etage ? 'border-destructive' : ''}
                />
                {errors.etage && (
                  <p className="text-sm text-destructive">{errors.etage.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classeId">Classe assignée (optionnel)</Label>
              <Select 
                value={watch('classeId')} 
                onValueChange={(value) => setValue('classeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune classe</SelectItem>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>
                      {classe.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description de la salle, équipements disponibles..."
                rows={3}
                {...register('description')}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la salle{' '}
              <span className="font-semibold">
                {selectedClassroom && formatClassroomName(selectedClassroom)}
              </span> ?
              <br /><br />
              <span className="text-red-600 font-medium">
                Cette action est irréversible et supprimera définitivement la salle 
                ainsi que toutes les assignations d'élèves.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Suppression...</span>
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassroomsAdminPage;