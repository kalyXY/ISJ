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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import { 
  ArrowLeft, 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Camera,
  Eye,
  EyeOff,
  Info
} from "lucide-react";
import axios from "axios";
import { ENDPOINTS, getAuthHeaders } from "@/config/api";
import { PersonFields } from '@/components/forms/person-fields';

// Schéma de validation amélioré
const createUserSchema = z.object({
  // Informations personnelles
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(9, "Le numéro de téléphone doit contenir au moins 9 chiffres").optional().or(z.literal("")),
  gender: z.enum(["M", "F"], { message: "Veuillez sélectionner un genre" }).optional(),
  birthDate: z.string().optional().or(z.literal("")),
  
  // Adresse
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postalCode: z.string().optional().or(z.literal("")),
  
  // Informations système
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["admin", "teacher", "student", "parent", "pending_parent"]),
  status: z.enum(["active", "inactive", "en_attente"]),
  
  // Informations supplémentaires
  bio: z.string().max(500, "La biographie ne peut pas dépasser 500 caractères").optional().or(z.literal("")),
  sendWelcomeEmail: z.boolean().default(true),
  
  // Champs conditionnels pour les étudiants
  parentPhone: z.string().optional().or(z.literal("")),
  matricule: z.string().optional().or(z.literal("")),
  
  // Champs conditionnels pour les enseignants
  specialization: z.string().optional().or(z.literal("")),
  diploma: z.string().optional().or(z.literal("")),
}).refine((data) => {
  // Validation conditionnelle pour les étudiants
  if (data.role === "student") {
    return data.parentPhone && data.parentPhone.length >= 9;
  }
  return true;
}, {
  message: "Le téléphone du parent est requis pour les étudiants",
  path: ["parentPhone"]
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const { user, isLoading } = useRequireAuth(["admin"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserFormValues>({
    // TODO: resolver type conflict in monorepo env; casting to any to avoid TS mismatch without changing behavior
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
      birthDate: "",
      address: "",
      city: "",
      postalCode: "",
      password: "",
      role: "teacher",
      status: "active",
      bio: "",
      sendWelcomeEmail: true,
      parentPhone: "",
      matricule: "",
      specialization: "",
      diploma: "",
    },
  });

  const selectedRole = watch("role");
  const selectedStatus = watch("status");
  const sendWelcomeEmail = watch("sendWelcomeEmail");

  const onSubmit = async (data: CreateUserFormValues) => {
    setIsSubmitting(true);
    try {
      // Nettoyer les champs optionnels vides
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => value !== "" && value !== undefined)
      );

      await axios.post(ENDPOINTS.USERS.CREATE, cleanedData, {
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "teacher": return "default";
      case "student": return "secondary";
      case "parent": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "en_attente": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <span>Créer un utilisateur</span>
          </h2>
          <p className="text-muted-foreground mt-2">
            Ajoutez un nouvel utilisateur au système avec toutes les informations nécessaires
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

      {/* Aperçu des sélections */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rôle:</span>
              <Badge variant={getRoleColor(selectedRole)}>
                {selectedRole === "admin" ? "Administrateur" :
                 selectedRole === "teacher" ? "Enseignant" :
                 selectedRole === "student" ? "Élève" :
                 selectedRole === "parent" ? "Parent" : "Parent en attente"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Statut:</span>
              <Badge variant={getStatusColor(selectedStatus)}>
                {selectedStatus === "active" ? "Actif" :
                 selectedStatus === "inactive" ? "Inactif" : "En attente"}
              </Badge>
            </div>
            {sendWelcomeEmail && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Mail className="h-4 w-4" />
                <span className="text-sm">Email de bienvenue sera envoyé</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Informations de base de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <PersonFields
              register={register}
              errors={errors as any}
              genderValue={watch("gender") || ""}
              onGenderChange={(value) => setValue("gender", value as "M" | "F")}
            />
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Adresse
            </CardTitle>
            <CardDescription>
              Informations de localisation (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">Adresse complète</Label>
              <Input
                id="address"
                placeholder="Avenue, rue, numéro..."
                {...register("address")}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
                <Input
                  id="city"
                  placeholder="Kinshasa"
                  {...register("city")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-sm font-medium">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="12345"
                  {...register("postalCode")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Informations système
            </CardTitle>
            <CardDescription>
              Accès et permissions de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@ecole-saintjoseph.cd"
                {...register("email")}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe sécurisé (min. 8 caractères)"
                  {...register("password")}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Rôle <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setValue("role", value as any)}
                >
                  <SelectTrigger className={errors.role ? "border-destructive focus-visible:ring-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrateur
                      </div>
                    </SelectItem>
                    <SelectItem value="teacher">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Enseignant
                      </div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Élève
                      </div>
                    </SelectItem>
                    <SelectItem value="parent">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Parent
                      </div>
                    </SelectItem>
                    <SelectItem value="pending_parent">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Parent en attente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Statut <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => setValue("status", value as any)}
                >
                  <SelectTrigger className={errors.status ? "border-destructive focus-visible:ring-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Actif
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        Inactif
                      </div>
                    </SelectItem>
                    <SelectItem value="en_attente">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        En attente
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="sendWelcomeEmail" className="text-sm font-medium">
                  Envoyer un email de bienvenue
                </Label>
                <p className="text-xs text-muted-foreground">
                  L'utilisateur recevra ses identifiants par email
                </p>
              </div>
              <Switch
                id="sendWelcomeEmail"
                checked={sendWelcomeEmail}
                onCheckedChange={(checked) => setValue("sendWelcomeEmail", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Champs conditionnels selon le rôle */}
        {(selectedRole === "student" || selectedRole === "teacher") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Informations spécifiques
              </CardTitle>
              <CardDescription>
                Informations relatives au rôle sélectionné
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedRole === "student" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="matricule" className="text-sm font-medium">Matricule</Label>
                      <Input
                        id="matricule"
                        placeholder="MAT2024001"
                        {...register("matricule")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentPhone" className="text-sm font-medium">
                        Téléphone du parent <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="parentPhone"
                        type="tel"
                        placeholder="+243 900 000 000"
                        {...register("parentPhone")}
                        className={errors.parentPhone ? "border-destructive focus-visible:ring-destructive" : ""}
                      />
                      {errors.parentPhone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          {errors.parentPhone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {selectedRole === "teacher" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="specialization" className="text-sm font-medium">Spécialisation</Label>
                      <Input
                        id="specialization"
                        placeholder="Mathématiques, Sciences, etc."
                        {...register("specialization")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="diploma" className="text-sm font-medium">Diplôme</Label>
                      <Input
                        id="diploma"
                        placeholder="Licence, Master, etc."
                        {...register("diploma")}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Informations supplémentaires */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Informations supplémentaires
            </CardTitle>
            <CardDescription>
              Biographie et notes additionnelles (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">Biographie</Label>
              <Textarea
                id="bio"
                placeholder="Description courte de l'utilisateur, ses compétences, ses responsabilités..."
                rows={4}
                {...register("bio")}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Maximum 500 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/users')}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center gap-2"
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
} 