"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth";
import { useAuthRedirect } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Spinner from "@/components/ui/spinner";
import { Mail, Lock, LogIn } from "lucide-react";

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const { redirectToRoleDashboard } = useAuthRedirect();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Connexion réussie");
      await redirectToRoleDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const formStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem'
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '1rem'
    },
    heading: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: 'var(--foreground)',
      marginBottom: '0.5rem'
    },
    subheading: {
      fontSize: '0.875rem',
      color: 'var(--muted-foreground)'
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem'
    },
    fieldGroup: {
      marginBottom: '1rem'
    },
    labelWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'var(--foreground)'
    },
    forgotPassword: {
      fontSize: '0.75rem',
      color: 'var(--primary)',
      textDecoration: 'none'
    },
    error: {
      color: 'var(--destructive)',
      fontSize: '0.75rem',
      marginTop: '0.25rem'
    },
    button: {
      width: '100%',
      padding: '0.5rem 1rem',
      backgroundColor: 'var(--primary)',
      color: 'var(--primary-foreground)',
      borderRadius: '0.375rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      border: 'none',
      marginTop: '1rem'
    },
    footer: {
      textAlign: 'center' as const,
      fontSize: '0.875rem',
      marginTop: '1.5rem'
    },
    footerText: {
      color: 'var(--muted-foreground)'
    },
    footerLink: {
      color: 'var(--primary)',
      fontWeight: '500',
      textDecoration: 'none',
      marginLeft: '0.25rem'
    }
  };

  return (
    <div style={formStyles.container}>
      <div style={formStyles.header}>
        <h2 style={formStyles.heading}>Connexion</h2>
        <p style={formStyles.subheading}>
          Entrez vos identifiants pour accéder à votre compte
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} style={formStyles.form}>
        <div style={formStyles.fieldGroup}>
          <label htmlFor="email" style={formStyles.label}>
            Adresse email
          </label>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)'
            }}>
              <Mail size={16} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                backgroundColor: 'var(--background)',
                border: errors.email 
                  ? '1px solid var(--destructive)' 
                  : '1px solid var(--input)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p style={formStyles.error}>{errors.email.message}</p>
          )}
        </div>
        
        <div style={formStyles.fieldGroup}>
          <div style={formStyles.labelWrapper}>
            <label htmlFor="password" style={formStyles.label}>
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              style={formStyles.forgotPassword}
            >
              Mot de passe oublié?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)'
            }}>
              <Lock size={16} />
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem 0.625rem 2.5rem',
                backgroundColor: 'var(--background)',
                border: errors.password 
                  ? '1px solid var(--destructive)' 
                  : '1px solid var(--input)',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              {...register("password")}
            />
          </div>
          {errors.password && (
            <p style={formStyles.error}>{errors.password.message}</p>
          )}
        </div>
        
        <button 
          type="submit" 
          style={{
            ...formStyles.button,
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" color="white" className="mr-2" />
              <span>Connexion...</span>
            </>
          ) : (
            <>
              <LogIn size={16} style={{ marginRight: '0.5rem' }} />
              <span>Se connecter</span>
            </>
          )}
        </button>
      </form>
      
      <div style={formStyles.footer}>
        <span style={formStyles.footerText}>
          Vous n'avez pas de compte?
        </span>
        <Link href="/register" style={formStyles.footerLink}>
          Créer un compte
        </Link>
      </div>
    </div>
  );
} 