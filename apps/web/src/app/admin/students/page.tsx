'use client';

import { useEffect, useState } from 'react';
import { getStudents, archiveStudent } from '@/services/students';
import { type Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Archive, Eye } from 'lucide-react';
import { StudentTable } from '@/components/students/student-table';
import { StudentForm } from '@/components/students/student-form';
import { toast } from 'sonner';

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await getStudents({ page });
      setStudents(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('Archiver cet élève ?')) return;
    try {
      await archiveStudent(id);
      toast.success('Élève archivé');
      fetchStudents(pagination.page);
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de l\'archivage');
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    fetchStudents(pagination.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des élèves</h2>
          <p className="text-muted-foreground mt-1">Ajoutez, modifiez ou archivez les élèves de l'établissement.</p>
        </div>
        <Button onClick={() => { setSelectedStudent(null); setModalOpen(true); }} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Ajouter un élève
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des élèves</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentTable
            students={students}
            loading={loading}
            onEdit={(student) => { setSelectedStudent(student); setModalOpen(true); }}
            onArchive={handleArchive}
          />
        </CardContent>
      </Card>
      
      <StudentForm
        student={selectedStudent || undefined}
        open={modalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StudentsPage; 