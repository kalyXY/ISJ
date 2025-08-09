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
  XCircle,
  Filter,
  Users,
  Eye,
  MoreHorizontal
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        return <Badge variant="default" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">Actif</Badge>;
      case "inactive":
        return <Badge variant="destructive" className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">Inactif</Badge>;
      case "en_attente":
        return <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Fonction pour afficher le rôle avec un texte formaté
  const renderRole = (role: string) => {
    const roleConfig = {
      admin: { label: "Administrateur", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" },
      teacher: { label: "Enseignant", color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" },
      student: { label: "Élève", color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" },
      parent: { label: "Parent", color: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200" },
      pending_parent: { label: "Parent (en attente)", color: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200" },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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
    <div className="space-y-8">
      {/* En-tête avec titre et bouton d'ajout */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestion des utilisateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Gérez les comptes utilisateurs de votre école
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Users className="h-4 w-4" />
                <span>{pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}</span>
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {pagination.page} sur {pagination.pages}
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push("/admin/users/create")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Créer un utilisateur
          </Button>
        </div>
      </div>
      
      {/* Filtres */}
      <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800/50 dark:to-slate-700/50 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Filtres de recherche</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Affinez votre recherche d'utilisateurs</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recherche
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, prénom ou email"
                  className="pl-10 h-12 bg-white/80 dark:bg-slate-800/80 border-gray-200/60 dark:border-gray-700/60 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle
              </label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border-gray-200/60 dark:border-gray-700/60 rounded-xl">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? "Chargement..." : `${pagination.total} résultat${pagination.total > 1 ? 's' : ''} trouvé${pagination.total > 1 ? 's' : ''}`}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={resetFilters} 
                disabled={isLoading}
                className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
              <Button 
                onClick={applyFilters} 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tableau des utilisateurs */}
      <Card className="border-gray-200/60 dark:border-gray-800/60 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Chargement des utilisateurs...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Aucun utilisateur ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou créez un nouvel utilisateur.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser les filtres
                </Button>
                <Button onClick={() => router.push('/admin/users/create')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer un utilisateur
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl">
                <Table>
                  <TableHeader className="bg-gray-50/80 dark:bg-slate-800/80">
                    <TableRow className="border-b border-gray-200/60 dark:border-gray-800/60">
                      <TableHead className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Utilisateur</TableHead>
                      <TableHead className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Email</TableHead>
                      <TableHead className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Rôle</TableHead>
                      <TableHead className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Statut</TableHead>
                      <TableHead className="py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Inscription</TableHead>
                      <TableHead className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow 
                        key={user.id} 
                        className="border-b border-gray-200/60 dark:border-gray-800/60 hover:bg-gray-50/60 dark:hover:bg-slate-800/60 transition-all duration-200 group"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.emailVerified ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    Email vérifié
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XCircle className="h-3 w-3 text-red-500" />
                                    Email non vérifié
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-gray-700 dark:text-gray-300">{user.email}</div>
                        </TableCell>
                        <TableCell className="py-4 px-6">{renderRole(user.role)}</TableCell>
                        <TableCell className="py-4 px-6">{renderStatus(user.status)}</TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 px-6">
                          <div className="flex justify-end gap-2">
                            {user.role === "pending_parent" && user.status === "en_attente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setValidateDialogOpen(true);
                                }}
                                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                                title="Valider ce parent"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                align="end" 
                                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60"
                              >
                                <DropdownMenuItem
                                  onClick={() => router.push(`/admin/users/edit/${user.id}`)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="p-6 border-t border-gray-200/60 dark:border-gray-800/60 bg-gray-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} utilisateurs
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => changePage(Math.max(1, pagination.page - 1))}
                            className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => changePage(page)}
                                isActive={page === pagination.page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => changePage(Math.min(pagination.pages, pagination.page + 1))}
                            className={pagination.page === pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Modal de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-semibold">Confirmer la suppression</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  Cette action est irréversible.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <span className="font-semibold">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </span>{" "}
              ? Toutes les données associées seront définitivement perdues.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteUser} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Modal de confirmation de validation de parent */}
      <AlertDialog open={validateDialogOpen} onOpenChange={setValidateDialogOpen}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-gray-200/60 dark:border-gray-800/60">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-xl font-semibold">Confirmer la validation</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                  Activation du compte parent
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300">
              Êtes-vous sûr de vouloir valider le compte de{" "}
              <span className="font-semibold">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </span>{" "}
              ? Cette action activera le compte et permettra à l'utilisateur de se connecter.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={validateParent} 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Valider le compte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 