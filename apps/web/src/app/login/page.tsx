"use client"

import AuthLayout from "@/components/auth-layout";
import LoginForm from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="École Saint Joseph"
      subtitle="Système de gestion scolaire"
    >
      <LoginForm />
    </AuthLayout>
  );
}
