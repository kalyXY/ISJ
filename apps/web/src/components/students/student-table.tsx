"use client";

import { useState } from "react";
import { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useStudentActions } from "@/hooks/useStudents";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
}

export function StudentTable({ students, onEdit }: StudentTableProps) {
  const router = useRouter();
  const { deleteStudent, isLoading } = useStudentActions();
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const handleDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      await deleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matricule</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead className="hidden md:table-cell">Genre</TableHead>
            <TableHead className="hidden md:table-cell">Date de naissance</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead className="hidden md:table-cell">Promotion</TableHead>
            <TableHead className="hidden md:table-cell">Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Aucun élève trouvé
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.matricule}</TableCell>
                <TableCell>
                  {student.lastName} {student.firstName}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {student.gender === "M" ? "Masculin" : "Féminin"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDate(student.birthDate)}
                </TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell className="hidden md:table-cell">{student.promotion}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={student.isActive ? "default" : "destructive"}>
                    {student.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEdit(student)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStudentToDelete(student)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet élève ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'élève {studentToDelete?.lastName} {studentToDelete?.firstName} (matricule: {studentToDelete?.matricule}) de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 