"use client";

import { useState, useEffect } from 'react';
import { 
  getClasses, 
  createClasse, 
  updateClasse, 
  deleteClasse,
  getSections,
  getOptions,
  getAnneesScolaires,
  Section,
  Option,
  Classe,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2, Book, Users } from 'lucide-react';
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

// Schema de validation pour le formulaire
const classeSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom de la classe est requis' }),
  sectionId: z.string().min(1, { message: 'La section est requise' }),
  optionId: z.string().optional(),
  anneeScolaire: z.string().min(1, { message: "L'année scolaire est requise" }),
});

type ClasseFormValues = z.infer<typeof classeSchema>;

export default function ClassesTab() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Classe[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [anneesScolaires, setAnneesScolaires] = useState<AnneeScolaire[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentClasse, setCurrentClasse] = useState<Classe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ClasseFormValues>({
    resolver: zodResolver(classeSchema),
    defaultValues: {
      nom: '',
      sectionId: '',
      optionId: '',
      anneeScolaire: '',
    },
  });

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Chargement parallèle des données
      const [classesData, sectionsData, optionsData, anneesData] = await Promise.all([
        getClasses(),
        getSections(),
        getOptions(),
        getAnneesScolaires()
      ]);
      
      setClasses(classesData);
      setSections(sectionsData);
      setOptions(optionsData);
      setAnneesScolaires(anneesData);
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
    setCurrentClasse(null);
    form.reset({
      nom: '',
      sectionId: '',
      optionId: 'none',
      anneeScolaire: anneesScolaires.find(a => a.actuelle)?.nom || '',
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale d'édition
  const openEditDialog = (classe: Classe) => {
    setCurrentClasse(classe);
    form.reset({
      nom: classe.nom,
      sectionId: classe.sectionId,
      optionId: classe.optionId || 'none',
      anneeScolaire: classe.anneeScolaire,
    });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteDialog = (classe: Classe) => {
    setCurrentClasse(classe);
    setIsDeleteDialogOpen(true);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (values: ClasseFormValues) => {
    // Si optionId est une chaîne vide ou "none", la définir à undefined
    const formattedValues = {
      ...values,
      optionId: values.optionId === '' || values.optionId === 'none' ? undefined : values.optionId
    };

    try {
      setIsSubmitting(true);
      if (currentClasse) {
        // Mise à jour
        await updateClasse(currentClasse.id, formattedValues);
        toast({
          title: "Succès",
          description: "La classe a été mise à jour avec succès",
        });
      } else {
        // Création
        await createClasse(formattedValues);
        toast({
          title: "Succès",
          description: "La classe a été créée avec succès",
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

  // Supprimer une classe
  const handleDelete = async () => {
    if (!currentClasse) return;
    try {
      setIsSubmitting(true);
      await deleteClasse(currentClasse.id);
      toast({
        title: "Succès",
        description: "La classe a été supprimée avec succès",
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

  // Trouver le nom de la section par ID
  const getSectionName = (sectionId: string): string => {
    return sections.find(section => section.id === sectionId)?.nom || 'N/A';
  };

  // Trouver le nom de l'option par ID
  const getOptionName = (optionId?: string): string => {
    if (!optionId) return 'N/A';
    return options.find(option => option.id === optionId)?.nom || 'N/A';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Classes</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter une classe
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">Aucune classe trouvée</p>
          <Button onClick={openAddDialog} variant="outline">
            Créer votre première classe
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la classe</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Option</TableHead>
                <TableHead>Année scolaire</TableHead>
                <TableHead>Statistiques</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classe) => (
                <TableRow key={classe.id}>
                  <TableCell className="font-medium">{classe.nom}</TableCell>
                  <TableCell>{getSectionName(classe.sectionId)}</TableCell>
                  <TableCell>{getOptionName(classe.optionId)}</TableCell>
                  <TableCell>{classe.anneeScolaire}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {classe._count?.students || 0} élèves
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Book className="h-3 w-3" />
                        {classe._count?.matieres || 0} matières
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(classe)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(classe)}
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

      {/* Dialogue d'ajout/édition de classe */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentClasse ? "Modifier la classe" : "Ajouter une classe"}
            </DialogTitle>
            <DialogDescription>
              {currentClasse
                ? "Modifiez les détails de la classe ci-dessous."
                : "Entrez les informations de la nouvelle classe."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la classe</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1ère A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="optionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option (optionnel)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une option (optionnel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Aucune option</SelectItem>
                        {options.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Vous pouvez sélectionner une option spécifique pour cette classe ou laisser ce champ vide.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anneeScolaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année scolaire</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une année scolaire" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {anneesScolaires.map((annee) => (
                          <SelectItem 
                            key={annee.id} 
                            value={annee.nom}
                          >
                            {annee.nom} {annee.actuelle && '(Actuelle)'}
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
                  {currentClasse ? "Mettre à jour" : "Créer"}
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
              Cette action ne peut pas être annulée. Cela supprimera définitivement la classe{" "}
              <span className="font-bold">{currentClasse?.nom}</span>.
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