"use client";

import { ReactNode } from "react";
import { AdminLayout } from "@/components/layout";

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  );
} 