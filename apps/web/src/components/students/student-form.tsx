"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Student, StudentFormData } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStudentActions } from "@/hooks/useStudents";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";

// Schéma de validation pour le formulaire
const studentFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  gender: z.enum(["M", "F"], {
    required_error: "Veuillez sélectionner un genre",
  }),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Format de date invalide",
  }),
  class: z.string().min(1, "La classe est requise"),
  promotion: z.string().min(1, "La promotion est requise"),
  matricule: z.string().min(3, "Le matricule doit contenir au moins 3 caractères"),
  parentPhone: z.string().min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres"),
  isActive: z.boolean().default(true),
});

interface StudentFormProps {
  student?: Student;
  open: boolean;
  onClose: () => void;
}

export function StudentForm({ student, open, onClose }: StudentFormProps) {
  const { createStudent, updateStudent, isLoading } = useStudentActions();
  const isEditing = !!student;

  // Initialiser le formulaire
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "M",
      birthDate: "",
      class: "",
      promotion: "",
      matricule: "",
      parentPhone: "",
      isActive: true,
    },
  });

  // Remplir le formulaire avec les données de l'élève en cas de modification
  useEffect(() => {
    if (student) {
      const birthDate = new Date(student.birthDate);
      form.reset({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        birthDate: format(birthDate, "yyyy-MM-dd"),
        class: student.class,
        promotion: student.promotion,
        matricule: student.matricule,
        parentPhone: student.parentPhone,
        isActive: student.isActive,
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        gender: "M",
        birthDate: "",
        class: "",
        promotion: "",
        matricule: "",
        parentPhone: "",
        isActive: true,
      });
    }
  }, [student, form]);

  // Gérer la soumission du formulaire
  const onSubmit = async (data: StudentFormData) => {
    try {
      if (isEditing && student) {
        await updateStudent(student.id, data);
      } else {
        await createStudent(data);
      }
      onClose();
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier un élève" : "Ajouter un nouvel élève"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations de l'élève ci-dessous."
              : "Remplissez le formulaire pour ajouter un nouvel élève."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculin</SelectItem>
                        <SelectItem value="F">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classe</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 6ème A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promotion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Promotion</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 2024-2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ISJ-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du parent</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: +243 123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Statut actif</FormLabel>
                    <FormDescription>
                      Indique si l'élève est actuellement inscrit à l'école
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Enregistrement..."
                  : isEditing
                  ? "Mettre à jour"
                  : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 