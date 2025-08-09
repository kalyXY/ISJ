'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getClasseById, type Classe } from '@/services/academics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Users, 
  BookOpen,
  Calendar,
  MapPin,
  GraduationCap,
  School,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from "@/components/ui/skeleton";

const ClassDetailPage = () => {
  const [classe, setClasse] = useState<Classe | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const fetchClasseDetails = async () => {
    setLoading(true);
    try {
      const data = await getClasseById(classId);
      setClasse(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des détails de la classe');
      // Rediriger vers la liste des classes si la classe n'existe pas
      router.push('/admin/classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchClasseDetails();
    }
  }, [classId]);

  const handleEdit = () => {
    if (classe) {
      router.push(`/admin/academique?tab=classes&edit=${classe.id}`);
    }
  };

  const getSectionDisplay = (classe: Classe) => {
    if (classe.section) {
      return classe.section.nom;
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!classe) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Classe non trouvée</h2>
        <p className="text-muted-foreground mb-4">
          La classe que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button onClick={() => router.push('/admin/classes')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/admin/classes')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              {classe.nom}
            </h2>
            <p className="text-muted-foreground mt-1">
              Détails de la classe et informations associées
            </p>
          </div>
        </div>
        <Button onClick={handleEdit} className="shrink-0">
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Grille d'informations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Nom de la classe :</span>
              <span className="font-medium">{classe.nom}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Année scolaire :</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{classe.anneeScolaire}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Section :</span>
              <Badge variant="secondary">
                {getSectionDisplay(classe)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Option :</span>
              <Badge variant="outline">
                {getOptionDisplay(classe)}
              </Badge>
            </div>
            {classe.salle && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Salle :</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{classe.salle}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Nombre d'élèves :</span>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-bold text-lg text-primary">
                  {classe._count?.students || 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Nombre de matières :</span>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span className="font-bold text-lg text-green-600">
                  {classe._count?.matieres || 0}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Salles associées :</span>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="font-bold text-lg text-orange-600">
                  {classe.salle ? 1 : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de la classe :</span>
                <span className="font-mono text-xs">{classe.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Créée le :</span>
                <span>{new Date(classe.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Section ID :</span>
                <span className="font-mono text-xs">{classe.sectionId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modifiée le :</span>
                <span>{new Date(classe.updatedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier la classe
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/students?class=${classe.id}`)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Voir les élèves
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/academique?tab=matieres&class=${classe.id}`)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Gérer les matières
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassDetailPage;