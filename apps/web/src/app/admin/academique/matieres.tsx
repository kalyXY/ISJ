"use client";

import { useState, useEffect } from 'react';
import { 
  getAllMatieres, 
  createMatiere, 
  updateMatiere, 
  deleteMatiere,
  getClasses,
  Matiere,
  Classe
} from '@/services/academics';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2, School } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

// Schema de validation pour le formulaire
const matiereSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom de la matière est requis' }),
  classeId: z.string().min(1, { message: 'La classe est requise' }),
});

type MatiereFormValues = z.infer<typeof matiereSchema>;

export default function MatieresTab() {
  const { toast } = useToast();
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMatiere, setCurrentMatiere] = useState<Matiere | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MatiereFormValues>({
    resolver: zodResolver(matiereSchema),
    defaultValues: {
      nom: '',
      classeId: '',
    },
  });

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Chargement parallèle des données
      const [matieresData, classesData] = await Promise.all([
        getAllMatieres(),
        getClasses()
      ]);
      
      setMatieres(matieresData);
      setClasses(classesData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ouvrir la modale d'ajout
  const openAddDialog = () => {
    setCurrentMatiere(null);
    form.reset({
      nom: '',
      classeId: '',
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale d'édition
  const openEditDialog = (matiere: Matiere) => {
    setCurrentMatiere(matiere);
    form.reset({
      nom: matiere.nom,
      classeId: matiere.classeId,
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteDialog = (matiere: Matiere) => {
    setCurrentMatiere(matiere);
    setIsDeleteDialogOpen(true);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (values: MatiereFormValues) => {
    try {
      setIsSubmitting(true);
      if (currentMatiere) {
        // Mise à jour
        await updateMatiere(currentMatiere.id, values);
        toast({
          title: "Succès",
          description: "La matière a été mise à jour avec succès",
        });
      } else {
        // Création
        await createMatiere(values);
        toast({
          title: "Succès",
          description: "La matière a été créée avec succès",
        });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer une matière
  const handleDelete = async () => {
    if (!currentMatiere) return;
    try {
      setIsSubmitting(true);
      await deleteMatiere(currentMatiere.id);
      toast({
        title: "Succès",
        description: "La matière a été supprimée avec succès",
      });
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.response?.data?.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formater les informations de classe pour affichage
  const formatClasseInfo = (classe?: Classe) => {
    if (!classe) return 'N/A';
    
    let info = `${classe.nom}`;
    if (classe.section) {
      info += ` - ${classe.section.nom}`;
    }
    if (classe.option) {
      info += ` (${classe.option.nom})`;
    }
    
    return info;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Matières</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter une matière
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : matieres.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">Aucune matière trouvée</p>
          <Button onClick={openAddDialog} variant="outline">
            Créer votre première matière
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la matière</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Année scolaire</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matieres.map((matiere) => (
                <TableRow key={matiere.id}>
                  <TableCell className="font-medium">{matiere.nom}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <School className="h-3 w-3" />
                      {formatClasseInfo(matiere.classe)}
                    </Badge>
                  </TableCell>
                  <TableCell>{matiere.classe?.anneeScolaire || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(matiere)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(matiere)}
                      >
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

      {/* Dialogue d'ajout/édition de matière */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentMatiere ? "Modifier la matière" : "Ajouter une matière"}
            </DialogTitle>
            <DialogDescription>
              {currentMatiere
                ? "Modifiez les détails de la matière ci-dessous."
                : "Entrez les informations de la nouvelle matière."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la matière</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Mathématiques" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une classe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((classe) => (
                          <SelectItem key={classe.id} value={classe.id}>
                            {formatClasseInfo(classe)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentMatiere ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement la matière{" "}
              <span className="font-bold">{currentMatiere?.nom}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}