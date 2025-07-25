"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRequireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { ArrowLeft, UserPlus } from "lucide-react";
import axios from "axios";
import { ENDPOINTS, getAuthHeaders } from "@/config/api";

// Schéma de validation
const createUserSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["admin", "teacher", "student", "parent", "pending_parent"]),
  status: z.enum(["active", "inactive", "en_attente"]),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const { user, isLoading } = useRequireAuth(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "teacher",
      status: "active",
    },
  });

  const selectedRole = watch("role");
  const selectedStatus = watch("status");

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.post(ENDPOINTS.USERS.CREATE, data, {
        headers: getAuthHeaders()
      });
      toast.success(`Utilisateur ${data.role} créé avec succès`);
      router.push('/admin/users');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la création de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-primary font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            <span>Créer un utilisateur</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Ajoutez un nouvel utilisateur au système
          </p>
        </div>
        <Button 
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => router.push('/admin/users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Informations utilisateur</CardTitle>
          <CardDescription>
            Entrez les informations du nouvel utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  placeholder="Prénom"
                  {...register("firstName")}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Nom"
                  {...register("lastName")}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@ecole-saintjoseph.cd"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mot de passe sécurisé"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue("role", value as any)}
              >
                <SelectTrigger className={errors.role ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="student">Élève</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="pending_parent">Parent en attente</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Créer l'utilisateur</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 