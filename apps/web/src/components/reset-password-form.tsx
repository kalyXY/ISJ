"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

// Schéma de validation
const resetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "Veuillez confirmer votre mot de passe")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string | null;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setIsInvalidToken(true);
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', {
        token,
        password: data.password
      });
      
      setIsSuccess(true);
      toast.success("Mot de passe réinitialisé avec succès");
      
      // Rediriger vers la page de connexion après 3 secondes
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation du mot de passe");
      if (error.response?.status === 400) {
        setIsInvalidToken(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isInvalidToken) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Lien invalide</CardTitle>
          <CardDescription className="text-center">
            Le lien de réinitialisation est invalide ou a expiré
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez demander un nouveau lien de réinitialisation.
            </AlertDescription>
          </Alert>
          
          <Button asChild className="w-full">
            <Link href="/forgot-password">Demander un nouveau lien</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Mot de passe réinitialisé</CardTitle>
          <CardDescription className="text-center">
            Votre mot de passe a été réinitialisé avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/10 border-primary/20">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              Vous allez être redirigé vers la page de connexion dans quelques secondes.
            </AlertDescription>
          </Alert>
          
          <Button asChild className="w-full">
            <Link href="/login">Se connecter maintenant</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Réinitialiser le mot de passe</CardTitle>
        <CardDescription className="text-center">
          Entrez votre nouveau mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link href="/login" className="text-sm text-primary hover:underline">
          Retour à la connexion
        </Link>
      </CardFooter>
    </Card>
  );
} 