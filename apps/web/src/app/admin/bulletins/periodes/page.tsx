'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Plus, Edit, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { periodesService, type Periode } from '@/services/bulletins';

const PeriodesPage = () => {
  const router = useRouter();
  const [periodes, setPeriodes] = useState<Periode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriode, setSelectedPeriode] = useState<Periode | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    type: 'trimestre' as 'trimestre' | 'semestre',
    dateDebut: '',
    dateFin: '',
    anneeScolaireId: '',
    isActive: true
  });

  const fetchPeriodes = async () => {
    setLoading(true);
    try {
      const data = await periodesService.getAll();
      setPeriodes(data);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement des périodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPeriode) {
        await periodesService.update(selectedPeriode.id, formData);
        toast.success('Période modifiée avec succès');
      } else {
        await periodesService.create(formData);
        toast.success('Période créée avec succès');
      }
      setDialogOpen(false);
      resetForm();
      fetchPeriodes();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (periode: Periode) => {
    setSelectedPeriode(periode);
    setFormData({
      nom: periode.nom,
      type: periode.type,
      dateDebut: periode.dateDebut.split('T')[0],
      dateFin: periode.dateFin.split('T')[0],
      anneeScolaireId: periode.anneeScolaireId,
      isActive: periode.isActive
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette période ?')) return;
    try {
      await periodesService.delete(id);
      toast.success('Période supprimée avec succès');
      fetchPeriodes();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const handleValidate = async (id: string) => {
    if (!confirm('Valider cette période ? Cette action est irréversible.')) return;
    try {
      await periodesService.validate(id);
      toast.success('Période validée avec succès');
      fetchPeriodes();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la validation');
    }
  };

  const resetForm = () => {
    setSelectedPeriode(null);
    setFormData({
      nom: '',
      type: 'trimestre',
      dateDebut: '',
      dateFin: '',
      anneeScolaireId: '',
      isActive: true
    });
  };

  const getStatusBadge = (periode: Periode) => {
    if (periode.isValidated) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Validée</Badge>;
    }
    if (periode.isActive) {
      return <Badge variant="default" className="bg-blue-500"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
    }
    return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Périodes</h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les trimestres et semestres académiques
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle période
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {selectedPeriode ? 'Modifier la période' : 'Nouvelle période'}
              </DialogTitle>
              <DialogDescription>
                {selectedPeriode ? 'Modifiez les informations de la période.' : 'Créez une nouvelle période académique.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom de la période</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Trimestre 1, Semestre 1..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: 'trimestre' | 'semestre') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="semestre">Semestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDebut">Date de début</Label>
                  <Input
                    id="dateDebut"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFin">Date de fin</Label>
                  <Input
                    id="dateFin"
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">
                  {selectedPeriode ? 'Modifier' : 'Créer'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Liste des périodes</span>
          </CardTitle>
          <CardDescription>
            Gérez les périodes académiques de votre établissement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement des périodes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Bulletins</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {periodes.map((periode) => (
                  <TableRow key={periode.id}>
                    <TableCell className="font-medium">{periode.nom}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{periode.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(periode.dateDebut).toLocaleDateString()} - {new Date(periode.dateFin).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(periode)}</TableCell>
                    <TableCell>{periode._count?.notes || 0}</TableCell>
                    <TableCell>{periode._count?.bulletins || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {!periode.isValidated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidate(periode.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {!periode.isValidated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(periode)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {!periode.isValidated && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(periode.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && periodes.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune période</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par créer votre première période académique.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une période
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodesPage;