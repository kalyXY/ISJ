'use client';

import { useEffect, useState } from 'react';
import { getClasses, deleteClasse, type Classe } from '@/services/academics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen,
  Calendar,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

const ClassesAdminPage = () => {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<Classe | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await getClasses();
      setClasses(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleView = (classe: Classe) => {
    // Rediriger vers une page de détails de la classe
    router.push(`/admin/classes/${classe.id}`);
  };

  const handleEdit = (classe: Classe) => {
    // Rediriger vers la page de gestion académique > classes
    router.push(`/admin/academique?tab=classes&edit=${classe.id}`);
  };

  const handleDeleteClick = (classe: Classe) => {
    setClassToDelete(classe);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classToDelete) return;
    
    setDeleting(true);
    try {
      await deleteClasse(classToDelete.id);
      toast.success('Classe supprimée avec succès');
      fetchClasses();
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const getSectionDisplay = (classe: Classe) => {
    if (classe.section) {
      return classe.section.nom;
    }
    // Pour les classes 7ème et 8ème qui n'ont pas de section
    if (classe.nom.includes('7ème') || classe.nom.includes('8ème')) {
      return 'N/A';
    }
    return 'Non définie';
  };

  const getOptionDisplay = (classe: Classe) => {
    if (classe.option) {
      return classe.option.nom;
    }
    return 'N/A';
  };

  const getStudentCount = (classe: Classe) => {
    return classe._count?.students || 0;
  };

  const getSalleCount = (classe: Classe) => {
    // Pour l'instant, on considère qu'une classe = une salle
    // Dans le futur, on pourrait avoir plusieurs salles par classe logique
    return classe.salle ? 1 : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Gestion des classes
          </h2>
          <p className="text-muted-foreground mt-1">
            Consultez et gérez toutes les classes de l'établissement.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          <span>{classes.length} classe{classes.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tableau des classes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Liste des classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune classe trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classe</TableHead>
                    <TableHead>Année scolaire</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Option</TableHead>
                    <TableHead className="text-center">Salles</TableHead>
                    <TableHead className="text-center">Élèves</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classe) => (
                    <TableRow key={classe.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          {classe.nom}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {classe.anneeScolaire}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getSectionDisplay(classe)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getOptionDisplay(classe)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {getSalleCount(classe)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{getStudentCount(classe)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(classe)}
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(classe)}
                            className="h-8 w-8 hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(classe)}
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la classe{' '}
              <span className="font-semibold">{classToDelete?.nom}</span> ?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                Cette action est irréversible et supprimera définitivement la classe.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassesAdminPage;