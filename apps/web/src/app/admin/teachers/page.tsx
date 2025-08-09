"use client";

import { useEffect, useState, useCallback } from "react";
import { getEnseignants, type Enseignant, deleteEnseignant, createEnseignant, assignClasseMatiere, getTeacherUsers, type UserTeacher } from '@/services/teachers';
import { getClasses, type Classe, getAllMatieres, type Matiere } from '@/services/academics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { type ENDPOINTS } from '@/config/api';
import { DialogDescription } from '@/components/ui/dialog';
import { type DialogDescription } from '@/components/ui/dialog';


const TeachersPage = () => {
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Pour le modal d'ajout/édition (à venir)
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState<Enseignant | null>(null);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [users, setUsers] = useState<UserTeacher[]>([]);

  const fetchEnseignants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEnseignants();
      setEnseignants(data);
    } catch (e: any) {
      setError(e.message || "Erreur lors du chargement des enseignants");
      toast.error(e.message || "Erreur lors du chargement des enseignants");
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs avec role 'teacher' pour le select
  useEffect(() => {
    if (modalOpen) {
      getTeacherUsers().then(setUsers).catch(() => setUsers([]));
      getClasses().then(setClasses).catch(() => setClasses([]));
      getAllMatieres().then(setMatieres).catch(() => setMatieres([]));
    }
  }, [modalOpen]);

  // Formulaire react-hook-form
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      userId: '',
      classes: '',
      matieres: '',
    },
  });

  // Remise à zéro du formulaire à l'ouverture/fermeture
  useEffect(() => {
    if (!modalOpen) {
      reset({ userId: '', classes: '', matieres: '' });
    }
  }, [modalOpen, reset]);

  // Soumission du formulaire
  const onSubmit = useCallback(async (data: any) => {
    setFormLoading(true);
    try {
      // 1. Créer l'enseignant avec userId
      const enseignant = await createEnseignant({ userId: data.userId });
      // 2. Assigner classes et matières si sélectionnées
      const classeIds = data.classes ? [data.classes] : [];
      const matiereIds = data.matieres ? [data.matieres] : [];
      if (classeIds.length > 0 || matiereIds.length > 0) {
        await assignClasseMatiere(enseignant.id, {
          classeIds,
          matiereIds,
        });
      }
      toast.success('Enseignant ajouté avec succès');
      setModalOpen(false);
      fetchEnseignants();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'ajout de l'enseignant");
    } finally {
      setFormLoading(false);
    }
  }, [fetchEnseignants]);

  useEffect(() => {
    fetchEnseignants();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet enseignant ?")) return;
    try {
      await deleteEnseignant(id);
      toast.success("Enseignant supprimé");
      fetchEnseignants();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des enseignants</h2>
          <p className="text-muted-foreground mt-1">Ajoutez, modifiez ou supprimez les enseignants de l'établissement.</p>
        </div>
        <Button onClick={() => { setSelectedEnseignant(null); setModalOpen(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un enseignant
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des enseignants</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8 text-primary">Chargement...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : enseignants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun enseignant trouvé.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Matières</TableHead>
                    <TableHead>Classes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enseignants.map((ens) => (
                    <TableRow key={ens.id}>
                      <TableCell className="font-medium">{ens.nom}</TableCell>
                      <TableCell>{ens.email}</TableCell>
                      <TableCell>
                        {ens.matieres && ens.matieres.length > 0
                          ? ens.matieres.map((m) => m.nom).join(", ")
                          : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>
                        {ens.classes && ens.classes.length > 0
                          ? ens.classes.map((c) => c.nom).join(", ")
                          : <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" onClick={() => { setSelectedEnseignant(ens); setModalOpen(true); }} title="Modifier">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(ens.id)} title="Supprimer">
                            <Trash2 className="h-4 w-4 text-destructive" />
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
      {/* Modal d'ajout/édition */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent aria-describedby="dialog-desc">
          <DialogHeader>
            <DialogTitle>Ajouter un enseignant</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Remplissez le formulaire pour ajouter un enseignant à l’établissement.
          </DialogDescription>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="userId">Utilisateur enseignant</Label>
              <Select
                value={watch('userId')}
                onValueChange={(value) => setValue('userId', value)}
                disabled={formLoading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur enseignant" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName || ''} {user.lastName || ''} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
                {users.length === 0 && (
                  <div className="text-sm text-muted-foreground px-2 py-1">
                    Aucun utilisateur avec le rôle enseignant n'est disponible.
                  </div>
                )}
              </Select>
            </div>
            <div>
              <Label>Classe</Label>
              <Select
                value={watch('classes') || ''}
                onValueChange={(value) => setValue('classes', value)}
                disabled={formLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classe) => (
                    <SelectItem key={classe.id} value={classe.id}>{classe.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Matière</Label>
              <Select
                value={watch('matieres') || ''}
                onValueChange={(value) => setValue('matieres', value)}
                disabled={formLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la matière" />
                </SelectTrigger>
                <SelectContent>
                  {matieres.map((matiere) => (
                    <SelectItem key={matiere.id} value={matiere.id}>{matiere.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Spinner size="sm" /> : 'Ajouter'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading}>Annuler</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeachersPage; 