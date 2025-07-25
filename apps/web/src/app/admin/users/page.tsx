"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import Spinner from "@/components/ui/spinner";
import { toast } from "sonner";
import { 
  UserPlus, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { ENDPOINTS, getAuthHeaders } from "@/config/api";

// Types pour les utilisateurs
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function UsersPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["admin"]);
  const router = useRouter();
  
  // États pour les données et le chargement
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // États pour les modales
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Fonction pour charger les utilisateurs
  const loadUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", pagination.limit.toString());
      
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter && roleFilter !== "all") params.append("role", roleFilter);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await axios.get(`${ENDPOINTS.USERS.GET_ALL}?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors du chargement des utilisateurs"
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  // Charger les utilisateurs au chargement de la page
  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);
  
  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    loadUsers(1);
  };
  
  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    loadUsers(1);
  };
  
  // Fonction pour changer de page
  const changePage = (page: number) => {
    loadUsers(page);
  };
  
  // Fonction pour supprimer un utilisateur
  const deleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.delete(ENDPOINTS.USERS.DELETE(selectedUser.id), {
        headers: getAuthHeaders(),
      });
      
      toast.success("Utilisateur supprimé avec succès");
      loadUsers(pagination.page);
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression de l'utilisateur"
      );
    }
  };
  
  // Fonction pour valider un parent
  const validateParent = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.patch(ENDPOINTS.USERS.VALIDATE_PARENT(selectedUser.id), {}, {
        headers: getAuthHeaders(),
      });
      
      toast.success("Parent validé avec succès");
      loadUsers(pagination.page);
      setValidateDialogOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la validation du parent"
      );
    }
  };
  
  // Fonction pour afficher le statut avec un badge
  const renderStatus = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Actif</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactif</Badge>;
      case "en_attente":
        return <Badge variant="warning">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Fonction pour afficher le rôle avec un texte formaté
  const renderRole = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "teacher":
        return "Enseignant";
      case "student":
        return "Élève";
      case "parent":
        return "Parent";
      case "pending_parent":
        return "Parent (en attente)";
      default:
        return role;
    }
  };
  
  if (authLoading) {
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
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground mt-1">
            Gérez les utilisateurs du système
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/users/create")}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>
      
      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom ou email"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
            </div>
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="student">Élève</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="pending_parent">Parent (en attente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={resetFilters} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={applyFilters} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Tableau des utilisateurs */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucun utilisateur trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Essayez de modifier vos filtres ou créez un nouvel utilisateur.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{renderRole(user.role)}</TableCell>
                        <TableCell>{renderStatus(user.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {user.role === "pending_parent" && user.status === "en_attente" && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setValidateDialogOpen(true);
                                }}
                                title="Valider ce parent"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                              title="Modifier cet utilisateur"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              title="Supprimer cet utilisateur"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => changePage(Math.max(1, pagination.page - 1))}
                          disabled={pagination.page === 1}
                        />
                      </PaginationItem>
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                        (page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => changePage(page)}
                              isActive={page === pagination.page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            changePage(Math.min(pagination.pages, pagination.page + 1))
                          }
                          disabled={pagination.page === pagination.pages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser} className="bg-destructive text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal de confirmation de validation de parent */}
      <AlertDialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la validation</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir valider ce compte parent ? Cette action
              activera le compte et permettra à l'utilisateur de se connecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={validateParent} className="bg-green-600 text-white">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Valider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 