"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email("Adresse email invalide")
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/forgot-password', {
        email: data.email
      });
      
      setIsSuccess(true);
      
      // Pour la démo uniquement, afficher le lien de réinitialisation
      if (response.data.resetLink) {
        setResetLink(response.data.resetLink);
      }
      
      toast.success("Instructions de récupération envoyées à votre adresse email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi des instructions");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Email envoyé</CardTitle>
          <CardDescription className="text-center">
            Vérifiez votre boîte de réception pour les instructions de réinitialisation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-primary/10 border-primary/20">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription>
              Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe.
            </AlertDescription>
          </Alert>
          
          {/* Pour la démo uniquement, afficher le lien de réinitialisation */}
          {resetLink && (
            <div className="p-4 border rounded-md bg-muted">
              <p className="text-sm font-medium mb-2">Lien de réinitialisation (démo uniquement):</p>
              <Link href={resetLink} className="text-primary hover:underline break-all text-sm">
                {resetLink}
              </Link>
            </div>
          )}
          
          <Button asChild className="w-full">
            <Link href="/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Mot de passe oublié</CardTitle>
        <CardDescription className="text-center">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
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