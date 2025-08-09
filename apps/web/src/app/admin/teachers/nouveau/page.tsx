"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createEnseignant, getTeacherUsers, type UserTeacher } from '@/services/teachers';
import { getClasses, type Classe } from '@/services/academics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useForm } from 'react-hook-form';

interface FormData {
  userId: string;
  assignedClassroomId: string;
}

const NewTeacherPage = () => {
  const router = useRouter();
  const [users, setUsers] = useState<UserTeacher[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Formulaire react-hook-form
  const { handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      userId: '',
      assignedClassroomId: '',
    },
  });

  const selectedUserId = watch('userId');
  const selectedClassroomId = watch('assignedClassroomId');

  // Charger les utilisateurs enseignants et les classes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [usersData, classesData] = await Promise.all([
          getTeacherUsers(),
          getClasses()
        ]);
        setUsers(usersData);
        setClasses(classesData);
      } catch (error: any) {
        toast.error(error.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Soumission du formulaire
  const onSubmit = useCallback(async (data: FormData) => {
    if (!data.userId) {
      toast.error("Veuillez sélectionner un utilisateur enseignant");
      return;
    }

    setFormLoading(true);
    try {
      await createEnseignant({
        userId: data.userId,
        assignedClassroomId: data.assignedClassroomId === 'none' ? undefined : data.assignedClassroomId || undefined,
      });
      
      toast.success('Enseignant créé avec succès');
      router.push('/admin/teachers');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de l'enseignant");
    } finally {
      setFormLoading(false);
    }
  }, [router]);

  // Fonction pour formater le nom complet de la classe
  const formatClassroomName = (classe: Classe) => {
    let fullName = classe.nom;
    if (classe.salle) {
      fullName += ` ${classe.salle}`;
    }
    if (classe.section?.nom || classe.option?.nom) {
      const details = [classe.section?.nom, classe.option?.nom].filter(Boolean).join(' - ');
      fullName += ` (${details})`;
    }
    return fullName;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Nouvel enseignant</h2>
            <p className="text-muted-foreground mt-1">Créer un enseignant et l'affecter à une salle de classe</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nouvel enseignant</h2>
          <p className="text-muted-foreground mt-1">Créer un enseignant et l'affecter à une salle de classe titulaire</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'enseignant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="userId">Utilisateur enseignant *</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={(value) => setValue('userId', value)}
                  disabled={formLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur enseignant" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(user => user.id && user.id.trim() !== '') // Filtrer les utilisateurs sans ID valide
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName || ''} {user.lastName || ''} ({user.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {users.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucun utilisateur avec le rôle enseignant n'est disponible.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedClassroomId">Salle titulaire</Label>
                <Select
                  value={selectedClassroomId}
                  onValueChange={(value) => setValue('assignedClassroomId', value)}
                  disabled={formLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la salle titulaire (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune salle</SelectItem>
                    {classes
                      .filter(classe => classe.id && classe.id.trim() !== '') // Filtrer les classes sans ID valide
                      .map((classe) => (
                        <SelectItem key={classe.id} value={classe.id}>
                          {formatClassroomName(classe)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  L'enseignant sera titulaire de cette salle de classe. Vous pouvez modifier cette affectation à tout moment.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={formLoading || !selectedUserId}
                className="min-w-[140px]"
              >
                {formLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Créer l'enseignant
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTeacherPage;