"use client"

import { type AuthLayout } from "@/components/auth-layout";
import ResetPasswordForm from "@/components/reset-password-form";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <AuthLayout>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
} 