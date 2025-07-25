"use client";

import { useState, useEffect } from 'react';
import { 
  getSections, 
  createSection, 
  updateSection, 
  deleteSection,
  Section
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
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Pencil, Trash2, Loader2 } from 'lucide-react';
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

// Schema de validation pour le formulaire
const sectionSchema = z.object({
  nom: z.string().min(1, { message: 'Le nom de la section est requis' }),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function SectionsTab() {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      nom: '',
    },
  });

  // Charger les sections
  const loadSections = async () => {
    try {
      setLoading(true);
      const data = await getSections();
      setSections(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  // Ouvrir la modale d'ajout
  const openAddDialog = () => {
    setCurrentSection(null);
    form.reset({ nom: '' });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale d'édition
  const openEditDialog = (section: Section) => {
    setCurrentSection(section);
    form.reset({ nom: section.nom });
    setIsDialogOpen(true);
  };

  // Ouvrir la modale de suppression
  const openDeleteDialog = (section: Section) => {
    setCurrentSection(section);
    setIsDeleteDialogOpen(true);
  };

  // Soumettre le formulaire (création ou mise à jour)
  const onSubmit = async (values: SectionFormValues) => {
    try {
      setIsSubmitting(true);
      if (currentSection) {
        // Mise à jour
        await updateSection(currentSection.id, values);
        toast({
          title: "Succès",
          description: "La section a été mise à jour avec succès",
        });
      } else {
        // Création
        await createSection(values);
        toast({
          title: "Succès",
          description: "La section a été créée avec succès",
        });
      }
      setIsDialogOpen(false);
      loadSections();
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

  // Supprimer une section
  const handleDelete = async () => {
    if (!currentSection) return;
    try {
      setIsSubmitting(true);
      await deleteSection(currentSection.id);
      toast({
        title: "Succès",
        description: "La section a été supprimée avec succès",
      });
      setIsDeleteDialogOpen(false);
      loadSections();
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
        <h2 className="text-2xl font-bold">Sections</h2>
        <Button onClick={openAddDialog} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Ajouter une section
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">Aucune section trouvée</p>
          <Button onClick={openAddDialog} variant="outline">
            Créer votre première section
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la section</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium">{section.nom}</TableCell>
                  <TableCell>{new Date(section.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(section)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(section)}
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

      {/* Dialogue d'ajout/édition de section */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentSection ? "Modifier la section" : "Ajouter une section"}
            </DialogTitle>
            <DialogDescription>
              {currentSection
                ? "Modifiez les détails de la section ci-dessous."
                : "Entrez les informations de la nouvelle section."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la section</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Commerciale" {...field} />
                    </FormControl>
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
                  {currentSection ? "Mettre à jour" : "Créer"}
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
              Cette action ne peut pas être annulée. Cela supprimera définitivement la section{" "}
              <span className="font-bold">{currentSection?.nom}</span>.
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