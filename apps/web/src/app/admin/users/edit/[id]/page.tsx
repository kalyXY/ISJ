"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { ArrowLeft, UserCog, AlertCircle } from "lucide-react";
import axios from "axios";
import { ENDPOINTS, getAuthHeaders } from "@/config/api";

// Schéma de validation
const updateUserSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional().or(z.literal("")),
  role: z.enum(["admin", "teacher", "student", "parent", "pending_parent"]),
  status: z.enum(["active", "inactive", "en_attente"]),
});

type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export default function EditUserPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
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

  // Charger les données de l'utilisateur
  useEffect(() => {
    if (user) {
      const loadUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(ENDPOINTS.USERS.GET_BY_ID(userId), {
            headers: getAuthHeaders(),
          });
          
          const userData = response.data;
          reset({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: "",
            role: userData.role,
            status: userData.status,
          });
        } catch (error: any) {
          setError(error.response?.data?.message || "Erreur lors du chargement de l'utilisateur");
          toast.error("Erreur lors du chargement de l'utilisateur");
        } finally {
          setIsLoading(false);
        }
      };
      
      loadUser();
    }
  }, [user, userId, reset]);

  const onSubmit = async (data: UpdateUserFormValues) => {
    setIsSubmitting(true);
    try {
      // Si le mot de passe est vide, ne pas l'envoyer
      if (!data.password) {
        delete data.password;
      }
      
      await axios.put(ENDPOINTS.USERS.UPDATE(userId), data, {
        headers: getAuthHeaders(),
      });
      
      toast.success("Utilisateur mis à jour avec succès");
      router.push("/admin/users");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="mt-4 text-primary font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste des utilisateurs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            <span>Modifier l'utilisateur</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Modifiez les informations de l'utilisateur
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
            Modifiez les informations de l'utilisateur
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
              <Label htmlFor="password">
                Mot de passe <span className="text-muted-foreground">(laisser vide pour ne pas modifier)</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Nouveau mot de passe"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    <SelectItem value="pending_parent">Parent (en attente)</SelectItem>
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
                    <span>Mise à jour en cours...</span>
                  </>
                ) : (
                  <>
                    <UserCog className="h-4 w-4" />
                    <span>Mettre à jour</span>
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