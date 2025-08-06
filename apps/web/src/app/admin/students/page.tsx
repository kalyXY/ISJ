import React from 'react';
import { getStudentsServer } from '@/services/students';
import { type Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Archive, Eye } from 'lucide-react';
import { StudentTable } from '@/components/students/student-table';
import { StudentForm } from '@/components/students/student-form';

const StudentsPage = async () => {
  try {
    const { data: students, pagination } = await getStudentsServer();
    // Les props d'interactivité (modals, edit, archive) doivent être gérés dans StudentTable/StudentForm (Client Components)
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Gestion des élèves</h2>
            <p className="text-muted-foreground mt-1">Ajoutez, modifiez ou archivez les élèves de l'établissement.</p>
          </div>
          {/* Le bouton d'ajout peut ouvrir un modal via un Client Component */}
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Liste des élèves</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentTable students={students} pagination={pagination} />
          </CardContent>
        </Card>
        {/* Le StudentForm/modal doit être déclenché côté client */}
      </div>
    );
  } catch (e: any) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-destructive">Erreur lors du chargement des élèves : {e.message}</span>
      </div>
    );
  }
};

export default StudentsPage; 