"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout";
import { useRequireAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import axios from "axios";
import { api } from '@/lib/api';

interface PendingParent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export default function PendingParentsPage() {
  const { user, isLoading } = useRequireAuth(["admin"]);
  const [pendingParents, setPendingParents] = useState<PendingParent[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPendingParents = async () => {
      try {
        setIsLoadingParents(true);
        const response = await api.get('/api/admin/parents/pending', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        setPendingParents(response.data.parents || []);
      } catch (error) {
        console.error('Erreur lors de la récupération des parents en attente:', error);
        toast.error('Erreur lors de la récupération des parents en attente');
      } finally {
        setIsLoadingParents(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchPendingParents();
    }
  }, [user]);

  const handleValidate = async (id: string) => {
    try {
      await api.patch(`/api/admin/parents/validate/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      setPendingParents(pendingParents.filter(parent => parent.id !== id));
      toast.success('Compte parent validé avec succès');
    } catch (error) {
      console.error('Erreur lors de la validation du compte parent:', error);
      toast.error('Erreur lors de la validation du compte parent');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.delete(`/api/admin/parents/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      setPendingParents(pendingParents.filter(parent => parent.id !== id));
      toast.success('Compte parent rejeté et supprimé');
    } catch (error) {
      console.error('Erreur lors du rejet du compte parent:', error);
      toast.error('Erreur lors du rejet du compte parent');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p>Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Validation des comptes parents</h1>
            <p className="text-muted-foreground">
              Validez ou rejetez les demandes de création de comptes parents
            </p>
          </div>
          <Button onClick={() => router.push('/admin/dashboard')}>
            Retour au tableau de bord
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parents en attente de validation</CardTitle>
            <CardDescription>
              {pendingParents.length} compte(s) en attente de validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingParents ? (
              <div className="text-center py-8">Chargement des parents en attente...</div>
            ) : pendingParents.length === 0 ? (
              <div className="text-center py-8">Aucun parent en attente de validation</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de demande</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>
                        {parent.firstName} {parent.lastName}
                      </TableCell>
                      <TableCell>{parent.email}</TableCell>
                      <TableCell>
                        {new Date(parent.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleValidate(parent.id)}
                          >
                            Valider
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(parent.id)}
                          >
                            Rejeter
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 