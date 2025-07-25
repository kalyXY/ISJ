"use client";

import { useState, useEffect } from 'react';
import { 
  getAnneesScolaires, 
  createAnneeScolaire, 
  updateAnneeScolaire, 
  deleteAnneeScolaire,
  setCurrentAnneeScolaire,
  AnneeScolaire
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
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2, Check, Clock } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Schema de validation pour le formulaire
const anneeScolaireSchema = z.object({
  nom: z.string().min(1, { message: "Le nom de l'année scolaire est requis" }),
  debut: z.string().min(1, { message: "La date de début est requise" }),
  fin: z.string().min(1, { message: "La date de fin est requise" }),
  actuelle: z.boolean().default(false),
});

type AnneeScolaireFormValues = z.infer<typeof anneeScolaireSchema>;

export default function AnneeScolaireTab() {
  const { toast } = useToast();
  const [anneesScolaires, setAnneesScolaires] = useState<AnneeScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAnneeScolaire, setCurrentAnneeScolaire] = useState<AnneeScolaire | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnneeScolaireFormValues>({
    resolver: zodResolver(anneeScolaireSchema),
    defaultValues: {
      nom: '',
      debut: '',
      fin: '',
      actuelle: false,
    },
  });

  // Charger les années scolaires
  const loadAnneesScolaires = async () => {
    try {
      setLoading(true);
      const data = await getAnneesScolaires();
      setAnneesScolaires(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les années scolaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnneesScolaires();
  }, []);

  // Ouvrir la modale d'ajout
  const openAddDialog = () => {
    setCurrentAnneeScolaire(null);
    form.reset({
      nom: '',
      debut: new Date().toISOString().split('T')[0],
      fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      actuelle: false,
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale d'édition
  const openEditDialog = (anneeScolaire: AnneeScolaire) => {
    setCurrentAnneeScolaire(anneeScolaire);
    form.reset({
      nom: anneeScolaire.nom,
      debut: new Date(anneeScolaire.debut).toISOString().split('T')[0],
      fin: new Date(anneeScolaire.fin).toISOString().split('T')[0],
      actuelle: anneeScolaire.actuelle,
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteDialog = (anneeScolaire: AnneeScolaire) => {
    setCurrentAnneeScolaire(anneeScolaire);
    setIsDeleteDialogOpen(true);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (values: AnneeScolaireFormValues) => {
    try {
      setIsSubmitting(true);
      if (currentAnneeScolaire) {
        // Mise à jour
        await updateAnneeScolaire(currentAnneeScolaire.id, values);
        toast({
          title: "Succès",
          description: "L'année scolaire a été mise à jour avec succès",
        });
      } else {
        // Création
        await createAnneeScolaire(values);
        toast({
          title: "Succès",
          description: "L'année scolaire a été créée avec succès",
        });
      }
      setIsDialogOpen(false);
      loadAnneesScolaires();
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

  // Supprimer une année scolaire
  const handleDelete = async () => {
    if (!currentAnneeScolaire) return;
    try {
      setIsSubmitting(true);
      await deleteAnneeScolaire(currentAnneeScolaire.id);
      toast({
        title: "Succès",
        description: "L'année scolaire a été supprimée avec succès",
      });
      setIsDeleteDialogOpen(false);
      loadAnneesScolaires();
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

  // Définir l'année scolaire courante
  const handleSetCurrent = async (id: string) => {
    try {
      setIsSubmitting(true);
      await setCurrentAnneeScolaire(id);
      toast({
        title: "Succès",
        description: "L'année scolaire courante a été mise à jour",
      });
      loadAnneesScolaires();
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Années scolaires</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter une année scolaire
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : anneesScolaires.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">Aucune année scolaire trouvée</p>
          <Button onClick={openAddDialog} variant="outline">
            Créer votre première année scolaire
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Année scolaire</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {anneesScolaires.map((anneeScolaire) => (
                <TableRow key={anneeScolaire.id}>
                  <TableCell className="font-medium">{anneeScolaire.nom}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {new Date(anneeScolaire.debut).toLocaleDateString('fr-FR')} au {new Date(anneeScolaire.fin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {anneeScolaire.actuelle ? (
                      <Badge className="bg-green-600">Année en cours</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!anneeScolaire.actuelle && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetCurrent(anneeScolaire.id)}
                          disabled={isSubmitting}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Définir comme actuelle
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(anneeScolaire)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(anneeScolaire)}
                        disabled={anneeScolaire.actuelle} // Empêcher la suppression de l'année actuelle
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

      {/* Dialogue d'ajout/édition d'année scolaire */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAnneeScolaire ? "Modifier l'année scolaire" : "Ajouter une année scolaire"}
            </DialogTitle>
            <DialogDescription>
              {currentAnneeScolaire
                ? "Modifiez les détails de l'année scolaire ci-dessous."
                : "Entrez les informations de la nouvelle année scolaire."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'année scolaire</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2023-2024" {...field} />
                    </FormControl>
                    <FormDescription>
                      Entrez le nom de l'année scolaire (ex: 2023-2024)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="debut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de début</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="actuelle"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Année scolaire en cours
                      </FormLabel>
                      <FormDescription>
                        Définir cette année comme l'année scolaire en cours
                      </FormDescription>
                    </div>
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
                  {currentAnneeScolaire ? "Mettre à jour" : "Créer"}
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
              Cette action ne peut pas être annulée. Cela supprimera définitivement l'année scolaire{" "}
              <span className="font-bold">{currentAnneeScolaire?.nom}</span>.
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